# Web Notepad

支持 markdown , 编辑器基于[Vditor](https://github.com/Vanessa219/vditor)构建

![visitors](https://visitor-badge.glitch.me/badge?page_id=tsvico.web-notepad&left_color=green&right_color=red)

> 基于 [minimalist-web-notepad](https://github.com/pereorga/minimalist-web-notepad) 项目二次开发
> 由于和原项目代码相差较多，所以新建仓库

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

add config support sse

```
fastcgi_read_timeout 600s;
```

## Screenshots

![edit—view](https://s1.ax1x.com/2022/05/06/OnfXDO.png)

![markdown-view](https://cdn.jsdelivr.net/gh/tsvico/WebCDN/ImageHosting/image-20211012090048160.png)

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
