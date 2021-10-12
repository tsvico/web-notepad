# Web Notepad

支持 markdown![visitors](https://visitor-badge.glitch.me/badge?page_id=tsvico.web-notepad&left_color=green&right_color=red)

This is an open source clone of notepad.cc, which is now defunct.

See demo at https://notes.orga.cat or https://notes.orga.cat/whatever.

A version that allows for optional encryption using the Web Crypto API is available at the [encryption](https://github.com/pereorga/minimalist-web-notepad/tree/encryption) branch. A version with Docker is available at the [docker](https://github.com/pereorga/minimalist-web-notepad/tree/docker) branch.

## Installation

At the top of `index.php` file, change `$base_url` variable to point to your
site.

Make sure the web server is allowed to write to the `_tmp` directory.

### On Apache

You may need to enable mod_rewrite and set up `.htaccess` files in your site configuration.
See [How To Set Up mod_rewrite for Apache](https://www.digitalocean.com/community/tutorials/how-to-set-up-mod_rewrite-for-apache-on-ubuntu-14-04).

### On Nginx

To enable URL rewriting, put something like this in your configuration file:

If notepad is in the root directory:

```
location / {
    rewrite ^/([a-zA-Z0-9_-]+)$ /index.php?note=$1;
}
```

If notepad is in a subdirectory:

```
location ~* ^/notes/([a-zA-Z0-9_-]+)$ {
    try_files $uri /notes/index.php?note=$1;
}
```

## Screenshots

![Firefox](https://orga.cat/sites/default/files/images/firefox.png)

![IE](https://orga.cat/sites/default/files/images/ie.png)

![Edge](https://orga.cat/sites/default/files/images/edge.png)

![Chrome Android](https://orga.cat/sites/default/files/images/android_chrome_dark.png)

![Firefox Android](https://orga.cat/sites/default/files/images/android_firefox.png)

## Copyright and license

Copyright 2012 Pere Orga <pere@orga.cat>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this work except in compliance with the License.
You may obtain a copy of the License at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
