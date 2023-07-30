import os
import pandas as pd

# Get the current directory
current_directory = os.path.dirname(os.path.abspath(__file__))

# Join the relative file path with the current directory to get the absolute path
csv_file_path = os.path.join(current_directory, "./", "data.csv")

# Read the CSV file with the correct separator
data = pd.read_csv(csv_file_path, sep=';', encoding='utf-8')

# Drop rows with missing 'geo_lat' or 'geo_lon' values
data = data.dropna(subset=['geo_lat', 'geo_lon'])

# Convert the data to the desired JavaScript format
js_data = "export const addressPoints = [\n"
for _, row in data.iterrows():
    lat = row["geo_lat"]
    lon = row["geo_lon"]
    price = int(row["price"])  # Convert price to integer
    js_data += f"    [{lat}, {lon}, {price}],\n"

js_data += "];"

# Write the JavaScript data to the output file
js_output_file = os.path.join(current_directory, "addressPoints.js")
with open(js_output_file, "w", encoding='utf-8') as output_file:
    output_file.write(js_data)

print("JavaScript data has been written to addressPoints.js.")
