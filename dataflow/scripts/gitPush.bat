@echo off
echo.

set NodePackagesPath=C:\Users\Shane\Desktop\HS\dataflow
set NODE_PATH=%NodePackagesPath%

chdir /d C:\Users\Shane\Desktop\HS-GitPage\app\data

for /f "tokens=1-4 delims=/ " %%i in ("%date%") do (
     set dow=%%i
     set month=%%j
     set day=%%k
     set year=%%l
)

set datestr=%month%_%day%_%year%
echo datestr is %datestr%

git add *
git commit -m "%datestr% data"
git push
