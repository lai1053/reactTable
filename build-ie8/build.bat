setlocal
cd ..
cd compatible

set current=%cd%

echo start install node-modules...

call 1.bat


echo start build website-ie8-asset...
call 2.bat

cd ../
echo start build website-copy-asset...
call 3.bat

echo start build website-css-asset...
call 4.bat


pause

endlocal