"use strict";
/* eslint-disable */

var TemperatureMap = function (svg) {
  this.svg = svg;
  this.points = [];
  this.polygon = [];
  this.limits = {
    xMin: 0,
    xMax: 0,
    yMin: 0,
    yMax: 0,
  };
  this.size = {
    height: svg.viewBox.baseVal.height,
    width: svg.viewBox.baseVal.width,
  };
};

TemperatureMap.crossProduct = function (o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
};

TemperatureMap.pointInPolygon = function (point, vs) {
  var x = point.x,
    y = point.y,
    inside = false,
    i = 0,
    j = 0,
    xi = 0,
    xj = 0,
    yi = 0,
    yj = 0,
    intersect = false;

  j = vs.length - 1;
  for (i = 0; i < vs.length; i = i + 1) {
    xi = vs[i].x;
    yi = vs[i].y;
    xj = vs[j].x;
    yj = vs[j].y;

    intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
    j = i;
  }

  return inside;
};

TemperatureMap.squareDistance = function (p0, p1) {
  var x = p0.x - p1.x,
    y = p0.y - p1.y;

  return x * x + y * y;
};

TemperatureMap.hslToRgb = function (h, s, l) {
  var r, g, b, hue2rgb, q, p;

  if (s === 0) {
    r = g = b = l;
  } else {
    hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) {
        t += 1;
      } else if (t > 1) {
        t -= 1;
      }

      if (t >= 0.66) {
        return p;
      } else if (t >= 0.5) {
        return p + (q - p) * (0.66 - t) * 6;
      } else if (t >= 0.33) {
        return q;
      } else {
        return p + (q - p) * 6 * t;
      }
    };

    q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    p = 2 * l - q;
    r = hue2rgb(p, q, h + 0.33);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 0.33);
  }

  return [(r * 255) | 0, (g * 255) | 0, (b * 255) | 0]; // (x << 0) = Math.floor(x)
};

TemperatureMap.prototype.getColor = function (levels, value) {
  var val = value,
    tmp = 0,
    lim = 0.55,
    min = -30,
    max = 50,
    dif = max - min,
    lvs = 25;

  if (val < min) {
    val = min;
  }
  if (val > max) {
    val = max;
  }

  tmp = 1 - (1 - lim) - ((val - min) * lim) / dif;

  if (levels) {
    tmp = Math.round(tmp * lvs) / lvs;
  }

  return TemperatureMap.hslToRgb(tmp, 1, 0.5);
};

TemperatureMap.prototype.getPointValue = function (limit, point) {
  var counter = 0,
    arr = [],
    tmp = 0.0,
    dis = 0.0,
    inv = 0.0,
    t = 0.0,
    b = 0.0,
    pwr = 2,
    ptr;

  // From : https://en.wikipedia.org/wiki/Inverse_distance_weighting

  if (TemperatureMap.pointInPolygon(point, this.polygon)) {
    for (counter = 0; counter < this.points.length; counter = counter + 1) {
      dis = TemperatureMap.squareDistance(point, this.points[counter]);
      if (dis === 0) {
        return this.points[counter].value;
      }
      arr[counter] = [dis, counter];
    }

    arr.sort(function (a, b) {
      return a[0] - b[0];
    });

    for (counter = 0; counter < limit; counter = counter + 1) {
      ptr = arr[counter];
      inv = 1 / Math.pow(ptr[0], pwr);
      t = t + inv * this.points[ptr[1]].value;
      b = b + inv;
    }

    return t / b;
  } else {
    return -255;
  }
};

TemperatureMap.prototype.setConvexhullPolygon = function (points) {
  var lower = [],
    upper = [],
    i = 0;

  // Sort by 'y' to get yMin/yMax
  points.sort(function (a, b) {
    return a.y === b.y ? a.x - b.x : a.y - b.y;
  });

  this.limits.yMin = points[0].y;
  this.limits.yMax = points[points.length - 1].y;

  // Sort by 'x' to get convex hull polygon and xMin/xMax
  points.sort(function (a, b) {
    return a.x === b.x ? a.y - b.y : a.x - b.x;
  });

  this.limits.xMin = points[0].x;
  this.limits.xMax = points[points.length - 1].x;

  // Get convex hull polygon from points sorted by 'x'
  for (i = 0; i < points.length; i = i + 1) {
    while (
      lower.length >= 2 &&
      TemperatureMap.crossProduct(
        lower[lower.length - 2],
        lower[lower.length - 1],
        points[i]
      ) <= 0
    ) {
      lower.pop();
    }
    lower.push(points[i]);
  }

  for (i = points.length - 1; i >= 0; i = i - 1) {
    while (
      upper.length >= 2 &&
      TemperatureMap.crossProduct(
        upper[upper.length - 2],
        upper[upper.length - 1],
        points[i]
      ) <= 0
    ) {
      upper.pop();
    }
    upper.push(points[i]);
  }

  upper.pop();
  lower.pop();
  this.polygon = lower.concat(upper);
};

TemperatureMap.prototype.setPoints = function (arr, width, height) {
  this.points = arr;
  this.width = width;
  this.height = height;
  this.setConvexhullPolygon(this.points);
};

TemperatureMap.prototype.setRandomPoints = function (points, width, height) {
  var counter = 0,
    x = 0,
    y = 0,
    v = 0.0,
    rst = [];

  for (counter = 0; counter < points; counter = counter + 1) {
    x = parseInt((Math.random() * 100000) % width, 10);
    y = parseInt((Math.random() * 100000) % height, 10);
    v = (Math.random() * 100) / 2;

    if (Math.random() > 0.5) {
      v = -v;
    }
    if (Math.random() > 0.5) {
      v = v + 30;
    }

    rst.push({ x: x, y: y, value: v });
  }

  this.setPoints(rst, width, height);
};

TemperatureMap.prototype.drawLow = function (limit, res, clean, callback) {
  var self = this,
    svg = this.svg,
    dbl = 2 * res,
    col = [],
    cnt = 0,
    x = 0,
    y = 0,
    val = 0.0,
    str = "",
    xBeg = self.limits.xMin,
    yBeg = self.limits.yMin,
    xEnd = self.limits.xMax,
    yEnd = self.limits.yMax,
    lim = limit > self.points.length ? self.points.length : limit + 1,
    gradient;

  // Clear SVG
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }

  // Draw approximation
  for (x = xBeg; x < xEnd; x = x + res) {
    for (y = yBeg; y < yEnd; y = y + res) {
      val = self.getPointValue(lim, { x: x, y: y });
      if (val !== -255) {
        col = self.getColor(false, val);
        str = "rgba(" + col[0] + ", " + col[1] + ", " + col[2] + ", ";
        gradient = str + "0.5)";
        let rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("x", x - res);
        rect.setAttribute("y", y - res);
        rect.setAttribute("width", dbl);
        rect.setAttribute("height", dbl);
        rect.setAttribute("fill", gradient);
        svg.appendChild(rect);
      }
    }
  }

  // Erase polygon outsides
  if (clean && self.polygon.length > 1) {
    let polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );
    let points = self.polygon.map((p) => `${p.x},${p.y}`).join(" ");
    polygon.setAttribute("points", points);
    polygon.setAttribute("fill", "white");
    svg.appendChild(polygon);
  }

  if (typeof callback === "function") {
    callback();
  }
};

TemperatureMap.prototype.drawFull = function (levels, callback) {
  "use strict";
  var self = this,
    svg = this.svg,
    step = 0,
    col = [],
    cnt = 0,
    idx = 0,
    x = self.limits.xMin,
    y = self.limits.yMin,
    lim = self.points.length,
    val = 0.0,
    tBeg = 0,
    tDif = 0,
    xBeg = self.limits.xMin,
    xEnd = self.limits.xMax,
    yEnd = self.limits.yMax,
    bucleSteps = 100.0,
    recursive = function () {
      window.requestAnimationFrame(function (timestamp) {
        tBeg = new Date().getTime();
        for (cnt = 0; cnt < bucleSteps; cnt = cnt + 1) {
          val = self.getPointValue(lim, { x: x, y: y });
          if (val !== -255) {
            col = self.getColor(levels, val);
            let rect = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "rect"
            );
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("width", 1);
            rect.setAttribute("height", 1);
            rect.setAttribute(
              "fill",
              `rgba(${col[0]}, ${col[1]}, ${col[2]}, 0.5)`
            );
            svg.appendChild(rect);
          }
          x = x + 1;
          if (x > xEnd) {
            x = xBeg;
            y = y + 1;
          }
        }

        tDif = new Date().getTime() - tBeg;
        if (tDif === 0) {
          tDif = 1;
        }
        bucleSteps = (bucleSteps << 3) / tDif;

        if (y < yEnd) {
          recursive();
        } else if (typeof callback === "function") {
          callback();
        }
      });
    };

  recursive();
};

TemperatureMap.prototype.drawPoints = function (callback) {
  var self = this,
    PI2 = 2 * Math.PI,
    svg = this.svg;
  window.requestAnimationFrame(function (timestamp) {
    var col = [],
      idx = 0,
      pnt;

    for (idx = 0; idx < self.points.length; idx = idx + 1) {
      pnt = self.points[idx];

      col = self.getColor(false, pnt.value);

      let circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", pnt.x);
      circle.setAttribute("cy", pnt.y);
      circle.setAttribute("r", 8);
      circle.setAttribute("fill", `rgba(255, 255, 255, 0.5)`);
      circle.setAttribute("stroke", `rgb(${col[0]}, ${col[1]}, ${col[2]})`);
      svg.appendChild(circle);

      let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", pnt.x);
      text.setAttribute("y", pnt.y);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", "black");
      text.textContent = Math.round(pnt.value);
      svg.appendChild(text);
    }

    if (typeof callback === "function") {
      callback();
    }
  });
};

export default TemperatureMap;
