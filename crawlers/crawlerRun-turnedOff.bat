@echo off
echo.

set NodePackagesPath=C:\Users\Shane\Desktop\HS\crawlers
set NODE_PATH=%NodePackagesPath%

chdir /d C:\Users\Shane\Desktop\HS
node crawlers\crawler-discover.js
node crawlers\crawler-laweekly.js
node crawlers\feb-crawler-timeout.js

xcopy data\february\discover.json C:\Users\Shane\Desktop\HS-GitPage\app\data\february /Y
xcopy data\february\laweekly.json C:\Users\Shane\Desktop\HS-GitPage\app\data\february /Y
xcopy data\february\timeout.json C:\Users\Shane\Desktop\HS-GitPage\app\data\february /Y

for /f "tokens=1-4 delims=/ " %%i in ("%date%") do (
     set dow=%%i
     set month=%%j
     set day=%%k
     set year=%%l
)

set datestr=%month%_%day%_%year%
echo datestr is %datestr%

chdir /d C:\Users\Shane\Desktop\HS-GitPage\app\data
git add *
git commit -m "%datestr% data"
git push
