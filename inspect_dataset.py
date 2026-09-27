import os
import glob
import pandas as pd
import json
from collections import Counter
import ast
import re

files = sorted(glob.glob('TwitchDataset_raw/files/*.xlsx'))
print(f"Total files found: {len(files)}")

total_rows = 0
all_dfs = []

# Let's inspect in chunks or read all
for i, f in enumerate(files):
    try:
        df = pd.read_excel(f)
        total_rows += len(df)
        all_dfs.append(df)
    except Exception as e:
        print(f"Error reading {f}: {e}")
    if (i + 1) % 100 == 0:
        print(f"Processed {i + 1}/{len(files)} files, current row count: {total_rows}")

full_df = pd.concat(all_dfs, ignore_index=True)
print(f"Total raw rows: {len(full_df)}")

# Summary statistics
print("Shape:", full_df.shape)
print("Columns:", full_df.columns.tolist())

# Date range
full_df['SearchTime'] = pd.to_datetime(full_df['SearchTime'], errors='coerce')
min_date = full_df['SearchTime'].min()
max_date = full_df['SearchTime'].max()
print(f"Date range: {min_date} to {max_date}")

# Unique counts
unique_channels = full_df['Channel Name'].dropna().nunique()
unique_channel_ids = full_df['Channel Id'].dropna().nunique()
unique_games = full_df['Game Name'].dropna().nunique()
unique_game_ids = full_df['Game ID'].dropna().nunique()
print(f"Unique channel names: {unique_channels}, unique IDs: {unique_channel_ids}")
print(f"Unique game names: {unique_games}, unique IDs: {unique_game_ids}")

# Viewer counts
print("Viewer count summary:")
print(full_df['Viewer Count'].describe())

# Mature distribution
print("Is Mature distribution:")
print(full_df['Is Mature'].value_counts(dropna=False))

# Languages
print("Top 10 Languages:")
print(full_df['Language'].value_counts().head(10))

# Top 10 Games
print("Top 10 Games by count:")
print(full_df['Game Name'].value_counts().head(10))

# Sample Age Rating values
print("Sample Age Rating values:")
print(full_df['Age Rating'].dropna().value_counts().head(10))

# Sample Classification Labels values
print("Sample Classification Labels:")
print(full_df['Classification Labels'].dropna().value_counts().head(10))

# Sample Source URLs
print("Source URLs:")
print(full_df['Source URL'].value_counts().head(10))

# Save summary info to json
summary = {
    "total_files": len(files),
    "total_records": len(full_df),
    "date_min": str(min_date),
    "date_max": str(max_date),
    "unique_channels": int(unique_channels),
    "unique_games": int(unique_games),
    "total_viewers_sum": int(full_df['Viewer Count'].sum()),
    "avg_viewers": float(full_df['Viewer Count'].mean()),
    "max_viewers": int(full_df['Viewer Count'].max())
}

with open("dataset_initial_summary.json", "w", encoding="utf-8") as out:
    json.dump(summary, out, indent=2)

print("Saved dataset_initial_summary.json")
