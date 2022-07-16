# Simple Features Javascript

#### Simple Features Lib ####

The Simple Features Libraries were developed at the [National Geospatial-Intelligence Agency (NGA)](http://www.nga.mil/) in collaboration with [BIT Systems](https://www.caci.com/bit-systems/). The government has "unlimited rights" and is releasing this software to increase the impact of government investments by providing developers with the opportunity to take things in new directions. The software use, modification, and distribution rights are stipulated within the [MIT license](http://choosealicense.com/licenses/mit/).

### Pull Requests ###
If you'd like to contribute to this project, please make a pull request. We'll review the pull request and discuss the changes. All pull request contributions to this project will be released under the MIT license.

Software source code previously released under an open source license and then modified by NGA staff is considered a "joint work" (see 17 USC § 101); it is partially copyrighted, partially public domain, and as a whole is protected by the copyrights of the non-government authors and must be released according to the terms of the original open source license.

### About ###

[Simple Features](http://ngageoint.github.io/simple-features-js/) is a Javascript library of geometry objects and utilities based upon the [OGC Simple Feature Access](http://www.opengeospatial.org/standards/sfa) standard.

### Simple Feature Conversion Libraries ###

* [simple-features-wkb-js](https://github.com/ngageoint/simple-features-wkb-js) - Well Known Binary
* [simple-features-wkt-js](https://github.com/ngageoint/simple-features-wkt-js) - Well Known Text
* [simple-features-geojson-js](https://github.com/ngageoint/simple-features-geojson-js) - GeoJSON
* [simple-features-proj-js](https://github.com/ngageoint/simple-features-proj-js) - Projection

### Usage ###

View the latest [JS Docs](http://ngageoint.github.io/simple-features-js/docs/api/)

### Browser Usage ###

#### Browser Usage ####
```html
<script src="/path/to/simple-features-js/dist/sf.min.js"></script>
```
```javascript

const { Point, LineString, Polygon } = window.SimpleFeatures;

const point = new Point(0, 0);
const lineString = new LineString(point);
const polygon = new Polygon(lineString)

```

#### Node Usage ####
Pull from [NPM](https://www.npmjs.com/package/@ngageoint/simple-features-js)

```install
npm install --save simple-features-js
```
```javascript

const { Point, LineString, Polygon } = require("@ngageoint/simple-features-js");

const point = new Point(0, 0);
const lineString = new LineString(point);
const polygon = new Polygon(lineString)

```

### Build ###

[![Build & Test](https://github.com/ngageoint/simple-features-js/workflows/Build%20&%20Test/badge.svg)](https://github.com/ngageoint/simple-features-js/actions/workflows/build-test.yml)

Build this repository using Node.js:
   
    npm install
    npm run build
