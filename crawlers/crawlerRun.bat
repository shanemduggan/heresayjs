@echo off
echo.

set NodePackagesPath=C:\Users\Shane\Desktop\HS\crawlers // This is my path, you can edit them

set NODE_PATH=%NodePackagesPath%


echo Environment variables are successfully added.
echo. 
echo. 
echo. 

chdir /d C:\Users\Shane\Desktop\HS
node crawlers\crawler-discover.js

node crawlers\crawler-laweekly.js

node crawlers\feb-crawler-timeout.js
