Is My Site Up?
==============

A simple node process, just clone this on to your server. Update the .env file
and watch as your site get monitored like a pro. You can choose to be notified
via text or email. You can also adjust the timing of the site checks.

How it works?
-------------
The app is very simple. It runs a node process with forever and polls your
website at a predetermined interval. If it's unable to connect/doesn't receive
a status code of 200 or 304 (not modified) it will alert you that your website
is unavailable.