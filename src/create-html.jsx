/* eslint react/no-array-index-key: 0 */
/* eslint react/no-danger: 0 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import Helmet from 'react-helmet';

const Html = (props) => {
  const { assets, component, store } = props;
  const content = component ? renderToString(component) : '';

  const head = Helmet.rewind();

  return (
    <html lang="en-US">
      <head>
        {head.base.toComponent()}
        {head.title.toComponent()}
        {head.meta.toComponent()}
        {head.link.toComponent()}
        {head.script.toComponent()}

        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {Object.keys(assets.styles).map((style, key) => (
          <link
            href={assets.styles[style]}
            key={key}
            media="screen, projection"
            rel="stylesheet"
            type="text/css"
            charSet="UTF-8"
          />
        ))}
      </head>
      <body>
        <div id="content" dangerouslySetInnerHTML={{ __html: content }} />
        <script dangerouslySetInnerHTML={{ __html: `window.__INITIAL_STATE__=${JSON.stringify(store.getState())};` }} charSet="UTF-8" />
        <script src={assets.javascript.main} charSet="UTF-8" />
      </body>
    </html>
  );
};

export default (options) => {
  const rendered = renderToString(<Html {...options} />);
  return `<!doctype html>${rendered}`;
};
