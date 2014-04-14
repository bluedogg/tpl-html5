# html5 template

> Create a avanced html5-template.

## Init
```
git clone git://github.com/tttptd/tpl-html5.git . && bower i && npm i
```


## Tasks

Starting local autoreload server
```
grunt server
grunt server:includes
grunt server:dist
```

Customize Twitter Bootstrap
```
grunt bootstrap
```

Build vendor js and css files (with min-versions)
```
grunt build:vendor
```

Build your JS, CSS and HTML files with customized rules
```
grunt build
```
Or build it separately
```
grunt js
grunt css
grunt html
```

Delpoy your builded files
```
grunt deploy
```
