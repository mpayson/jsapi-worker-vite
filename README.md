# ArcGIS Maps SDK for JavaScript with custom workers with Vite

This repo demonstrates using [`@arcgis/core`](https://www.npmjs.com/package/@arcgis/core) ES modules with custom workers withe [Vite](https://vitejs.dev/), based on: https://github.com/Esri/jsapi-resources/tree/main/esm-samples/jsapi-custom-workers.

## Known Issues
- `@rollup/plugin-terser` has noticeably slower performance compared to `rollup-plugin-terser`. More information available on the [rollup](https://github.com/rollup/plugins/issues/1334) issue.

## Building workers

The key to using custom workers is building the workers separately from your main build. In this demo we use a separate [Vite mode](https://vitejs.dev/guide/env-and-mode.html#modes) to produce the worker builds and configure a few extra rollup options.

## Using workers

You can then use the workers in your application using the worker framework of the ArcGIS Maps SDK for JavaScript.

```js
// index.js
import config from "@arcgis/core/config";
...
import * as workers from "@arcgis/core/core/workers";

// configure where RemoteClient is located
config.workers.workerPath = "./RemoteClient.js";

// what loader to use, in this case SystemJS
config.workers.loaderUrl = "https://cdn.jsdelivr.net/npm/systemjs@6.12.1/dist/s.min.js";
...
  const results1= await layerView1.queryFeatures(query);
  const results2 = await layerView2.queryFeatures(query);

  // Load worker
  const spatialJoin = await workers.open(new URL("./SpatialJoin.js", document.baseURI).href);
  // You can only pass native JavaScript objects to workers,
  // so you can convert graphics to JSON.
  const features1 = results1.features.map((a) => a.toJSON());
  const features2 = results2.features.map((a) => a.toJSON());

  const jsonFeatures = await spatialJoin.invoke("doSpatialJoin", [features1, features2]);
  // Results are returned as JSON, so you can rehydrate to Graphics again
  const features = jsonFeatures.map((a) => Graphic.fromJSON(a));
```

As you can see, the provided worker framework creates a Promise-based layer on top of workers for easier use. Web workers can only pass native JavaScript objects back and forth. But you can load modules from `@arcgis/core` inside your worker.

```js
// spatial-join-worker.js
import Graphic from "@arcgis/core/Graphic";

export function doSpatialJoin([f1, f2]) {
  const features1 = f1.map((a) => Graphic.fromJSON(a));
  const features2 = f2.map((a) => Graphic.fromJSON(a));
  const features = [];
  let temp = [...features1];
  let temp2 = [];
  for (let feature of features2) {
    feature.attributes.count = 0;
    temp2 = [...temp];
    for (let i = 0; i < temp2.length; i++) {
      const x = temp[i];
      if (x && feature.geometry && x.geometry && feature.geometry.contains(x.geometry)) {
        feature.attributes.count++;
        temp.splice(i, 1);
      }
    }
    features.push(feature.toJSON());
  }
  return features;
}

```

For more details on using `@arcgis/core/core/workers`, you can review the [documentation](https://developers.arcgis.com/javascript/latest/api-reference/esri-core-workers.html).

For additional information, see the [Build with ES modules](https://developers.arcgis.com/javascript/latest/es-modules/) Guide topic in the SDK.

## Commands

For a list of all available `npm` commands see the scripts in `package.json`. 

### development

```
npm run dev
```

### production

```
npm run build
```
