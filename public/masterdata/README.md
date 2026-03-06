# Master Data Files

Place your Mozart master CSV exports here.
The app loads these files **automatically** for all users on startup.

## Files expected

| Filename | Mozart Export | Used by |
|---|---|---|
| `priorities.csv` | MZ_PARQ_Priorities_*.csv | CWO · Case · PPM |
| `locations.csv` | MZ_PARQ_Locations_*.csv | CWO · Case · PPM |
| `assets.csv` | MZ_PARQ_Assets_*.csv | CWO · Case · PPM |
| `problem_types.csv` | MZ_PARQ_Event Types*.csv | CWO (ProblemTypeId) |
| `event_types.csv` | MZ_PARQ_Event Types*.csv | Case (EventTypeId) |
| `service_categories.csv` | MZ_PARQ_ServiceCategories.csv | PPM |
| `frequency_types.csv` | MZ_PARQ_FrequencyTypes.csv | PPM |

## How to update

1. Export new master CSVs from Mozart
2. Rename them to match the filenames above
3. Replace the files in this folder
4. Commit and push to GitHub:

```bash
git add public/masterdata/
git commit -m "Update master data — $(date +%Y-%m-%d)"
git push origin main
```

GitHub Actions will rebuild and redeploy automatically (~1 min).
All users will get the updated master data on next page load.
