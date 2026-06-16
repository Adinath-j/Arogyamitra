import urllib.request
import traceback

url = "https://lh3.googleusercontent.com/aida/AP1WRLukCKZtlu-wrEtlYzH_Zi6KCxZM601SWi37oWdXDf8YwWChH-YRunVH4gEzB0K1muOck23h59Nu70dT8elP8z9DF2rLVvaFwE8aT80SOFbZ_ojLRy33IMJhekE7zgq0YUTAVNL3dZRG2EOOdTDzZEiHFSfWg38YF0vHWWJgrHLjFuY0XSTP6FFNMcu9davgB4NPEmA_YsULvQa4Wl8t6nkK4JC5rhDS0UbQBUPXgweEeoa430x5iP5WGCk"
try:
    urllib.request.urlretrieve(url, "aromi-avatar.svg")
    print("Download successful")
    with open("aromi-avatar.svg", "rb") as f:
        print(f.read(100))
except Exception as e:
    print("Error:", e)
    traceback.print_exc()
