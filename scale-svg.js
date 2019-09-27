const { parse: svgson, stringify } = require("svgson");

const svgpath = require("svgpath");
const toPath = require("element-to-path");
const fs = require("fs");

let vbwidth,vbheight

const scalePath = (node, scaleOptions) => {
  let o = Object.assign({}, node);
  const { scale: s } = scaleOptions || { scale: 1 };

  if (o.name === "svg" && o.attributes.viewBox) {
    const viewBox =o.attributes.viewBox
        .split(" ");
    vbwidth=viewBox[2];
    vbheight=viewBox[3]
  }

  if (/(rect|circle|ellipse|polygon|polyline|line|path)/.test(o.name)) {
    const path = toPath(o);
    const d = svgpath(path)
      .translate(-vbwidth/2, -vbheight/2)
      .scale(s)
      .translate(vbwidth/2, vbheight/2)
      .rel()
      .round(1)
      .toString();
    o.attributes = Object.assign({}, o.attributes, {
      d
    });
    for (const attr in o.attributes) {
      if (attr === "stroke-width" || attr === "strokeWidth") {
        o.attributes[attr] = +o.attributes[attr] * s;
      }
      if (!/fill|stroke|opacity|d/.test(attr)) {
        delete o.attributes[attr];
      }
    }
    o.name = "path";
  } else if (o.children && Array.isArray(o.children)) {
    const _scale = c => scalePath(c, scaleOptions);
    o.children = o.children.map(_scale);
  }

  return o;
};

const scaleThatSvg = async (svg, scaleOptions) => {
  const parsed = await svgson(svg);
  const scaled = scalePath(parsed, scaleOptions);
  return stringify(scaled);
};

const indexEs = async (input, scaleOptions) => {
  const svg = Buffer.isBuffer(input) ? input.toString() : input;
  return await scaleThatSvg(svg, scaleOptions);
};

fs.readFile("./icon/上海银行.svg", (err, input) => {
  indexEs(input, { scale: 1 - 1 / 16 }).then(scaled => {
    fs.writeFile("./icon/上海银行.svg", scaled,()=>{
    });
  });
});
