import { _wcl } from './common-lib.js';
import { _wccss } from './common-css.js';
import { colorPalette, buttons } from './fuji-css.js';

import Mustache from './mustache.js';
import 'https://unpkg.com/@blendvision/link@0.0.2';
import 'https://unpkg.com/@blendvision/player@2.20.4';
// import 'https://unpkg.com/@blendvision/player@2.21.0-canary.1';
import 'https://unpkg.com/@blendvision/chatroom-javascript-sdk/index.min.js';

/*
 reference:
 - https://developers.blendvision.com/zh/docs/player/web-sdk/quick-start
 - https://developers.blendvision.com/zh/docs/sdk/player/web/intro
 - https://www.npmjs.com/package/@blendvision/chatroom-javascript-sdk
 - https://www.npmjs.com/package/@blendvision/link
 - https://developer.chrome.com/docs/web-platform/document-picture-in-picture
 - https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API
 - https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 - https://web.dev/articles/css-individual-transform-properties
 - https://developer.chrome.com/blog/better-full-screen-mode
 - https://developer.chrome.com/blog/media-session
 - https://developer.mozilla.org/en-US/docs/Web/API/MediaSession
 - https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler
 - https://albyianna.medium.com/creating-an-auto-scrollable-element-with-css-b7d814c73522
 - https://css-tricks.com/a-dry-approach-to-color-themes-in-css/
 - https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
 - https://web.dev/articles/offscreen-canvas
 - https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
*/

const blankImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
const defaults = {
  playerconfig: {
    licenseKey: '',
    playbackToken: '',
    title: 'yahoo auction',
    source: []
  },
  chatroomconfig: {
    token: '',
    refreshToken: '',
    host: 'https://api.one.blendvision.com'
  },
  ysocket: {
    // id, url
  },
  share: {
    title: document.title,
    text: '',
    url: document?.querySelector('link[rel=canonical]')?.href || window.location.href
  },
  poster: blankImage,
  loop: false,
  autopilot: false,
  host: {
    avatar: blankImage,
    link: '#',
    name: '',
    count: 0,
    follow: false,
    announce: ''
  },
  messagetemplate: [],
  products: [
    /*
      {
        "id": "",
        "uuid": "",
        "title": "",
        "link": "",
        "thumbnail": "",
        "price": "$ 1,000",
        "marketPrice": "$ 2,000",
        "priceRange": {
          "min": "$ 1,000",
          "max": "$ 2,000",
        },
        "bestDiscount": "-40%",
        "marks": {
          "coupon": false,
          "shippingCoupon": false,
          "buynow": true,
          "bid": false
        },
        "buyCount": 0,
        "broadcasting": true
      }
    */
  ],
  type: 'live',
  l10n: {
    previewtrigger: 'View',
    listingshead: 'Products',
    buynow: 'BUY NOW',
    jointhecrowd: 'joined the crowd.',
    rushbuying: 'is rush buying.',
    addfavorite: 'added host as favorite.',
    sharelive: 'shared this LIVE.',
    takesnapshot: 'took snapshot.',
    achievetrophy: 'achieved {{hits}} likes.',
    highestbid: 'bid ${{price}} and become the highest bidder.',
    exceededbid: 'Someone has exceeded your last bid price ${{price}}.',
    wonbid: 'won the bid as price ${{price}}.',
    cancelledplacebid: 'Owner canceled {{nickname}}\'s bid.',
    placebid: 'has place bid as price ${{price}}.'
  }
};

const booleanAttrs = ['loop', 'autopilot'];
const objectAttrs = ['playerconfig', 'chatroomconfig', 'ysocket', 'share', 'host', 'products', 'l10n', 'messagetemplate'];
const custumEvents = {
  play: 'yahoo-x-bv-player-play',
  pause: 'yahoo-x-bv-player-pause',
  seeking: 'yahoo-x-bv-player-seeking',
  ended: 'yahoo-x-bv-player-ended',
  purchaseClick: 'yahoo-x-bv-player-purchase-click',
  followClick: 'yahoo-x-bv-player-follow-click',
  liveEnded: 'yahoo-x-bv-player-live-ended',
  addProduct: 'yahoo-x-bv-player-add-product'
};
const legalKey = [
  'k',
  's',
  'm',
  'f',
  ' ',
  'j',
  'l',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'ArrowLeft',
  'ArrowRight',
  'Escape'
];
const legalTypes = ['live', 'replay'];
const fullscreenEnabled = !!document.fullscreenEnabled;
const keyboardLockEnabled = !!navigator?.keyboard?.lock;
const pipEnabled = !!document.pictureInPictureEnabled;
const clearDelay = 2500;
const trophyMilestones = [50, 100, 1000];
const maxMessageCount = 50;

const template = document.createElement('template');
template.innerHTML = `
<style>
${_wccss}
${colorPalette}
${buttons}

:host {
  position: relative;
  inline-size: 100%;
  display: block;

  @media (display-mode: picture-in-picture) {
    block-size: 100%;

    .button--fullscreen,
    .button--share,
    .button--pip {
      display: none;
    }

    .main {
      --yahoo-logo-display: block;
      --preview-inset-block-start-stuff: 0px;
    }

    .listings {
      --buynow-button-pointer-events: none;
    }

    #live-controls {
      --button-count: 3;
    }
  }
}

:host(.yahoo-x-bv-player--refreshing) .main {
  --refreshing-axis-inline-start: -100%;
  --refreshing-axis-inline-end: 100%;
  --refreshing-axis-block-start: -100%;
  --refreshing-axis-block-end: 100%;
  --refreshing-button-scale: 1;
  --refreshing-button-pointer-events: auto;
}

.main {
  --ON: initial;
  --OFF: ;

  --LIVE: var(--ON);
  --REPLAY: var(--OFF);

  --padding-inline-basis: var(--yahoo-x-bv-player-padding-inline-basis, 12px);
  --padding-block-end-basis: var(--yahoo-x-bv-player-padding-block-end-basis, 8px);
  --padding-block-start-basis: 12px;

  --padding-inline: var(--padding-inline-basis);
  --padding-block-start: var(--padding-block-start-basis);
  --padding-block-end: var(--padding-block-end-basis);

  /* video */
  --video-object-fit: var(--yahoo-x-bv-player-video-object-fit, contain);

  /* refreshing */
  --refreshing-axis-inline-start: 0%;
  --refreshing-axis-inline-end: 0%;
  --refreshing-axis-block-start: 0%;
  --refreshing-axis-block-end: 0%;
  --refreshing-button-scale: 0;
  --refreshing-button-pointer-events: none;
  --refreshing-animation-duration: 450ms;
  --refreshing-animation-timing-function: ease;

  --slider-thumb-color: var(--yahoo-x-bv-player-slider-thumb-color, rgba(234 51 35));
  --slider-thumb-shadow-color: var(--yahoo-x-bv-player-slider-thumb-shadow-color, rgba(0 0 0));
  --slider-thumb-size: 14px;
  --slider-thumb-scale: 1;
  --slider-thumb-hover-scale: 1;
  --slider-thumb-active-scale: 1.5;

  --indicator-block-size: calc(var(--slider-thumb-size) * .35);
  --indicator-background: var(--yahoo-x-bv-player-indicator-background, rgba(255 255 255/.2));
  --indicator-buffer-start: var(--yahoo-x-bv-player-indicator-buffer-start, rgba(255 255 255/.4));
  --indicator-buffer-end: var(--yahoo-x-bv-player-indicator-buffer-end, rgba(255 255 255/.4));
  --indicator-duration-start: var(--yahoo-x-bv-player-indicator-duration-start, rgba(234 51 35));
  --indicator-duration-end: var(--yahoo-x-bv-player-indicator-duration-end, rgba(234 51 35));
  --indicator-scale: 1;
  --indicator-hover-scale: 1;

  /* controls */
  --time-info-text-size: 12px;
  --time-info-text-color: var(--yahoo-x-bv-player-time-info-text-color, rgba(255 255 255));
  --button-icon-color: var(--yahoo-x-bv-player-button-icon-color, rgba(255 255 255));
  --button-focus-visible-color: var(--yahoo-x-bv-player-button-focus-visible-background-color, rgba(0 0 0/.5));
  --button-size: 32;
  --control-axis-y: 0%;

  /* live-controls */
  --live-controls-input-font-size: 14px;
  --live-controls-input-text-color: var(--yahoo-x-bv-player-live-controls-input-text-color, rgba(255 255 255));
  --live-controls-input-placeholder-color: var(--yahoo-x-bv-player-live-controls-input-placeholder-color, rgba(255 255 255/.5));
  --live-controls-form-background-color: var(--yahoo-x-bv-player-live-controls-form-background-color, rgba(0 0 0/.75));
  --emotion-float-ratio: 4;

  /* host */
  --host-avatar-size: 32;
  --host-avatar-padding: 4px;
  --host-name-font-size: 12px;
  --host-count-font-size: 10px;
  --host-count-text: var(--yahoo-x-bv-player-host-count-text, 'viewers');

  /* poster */
  --poster-background-color: var(--yahoo-x-bv-player-poster-background-color, rgba(0 0 0));

  /* preview */
  --preview-inset-block-start-stuff: 0px;
  --preview-inset-block-start: calc(var(--preview-inset-block-start-stuff) + var(--padding-block-start-basis));
  --preview-image-size: 80px;
  --preview-background-color: rgba(0 0 0/.8);
  --preview-border-color: rgba(255 255 255/.2);
  --preview-button-background-color: rgba(255 255 255/.3);
  --preview-button-color: rgba(255 255 255);

  /* chatroom */
  --chatroom-max-inline-size: calc(100% / 2);
  --chatroom-max-block-size: 320px;
  --chatroom-message-owner-text: var(--yahoo-x-bv-player-chatroom-message-owner-text, 'HOST');
  --chatroom-message-owner-text-color: var(--yahoo-x-bv-player-chatroom-message-owner-text-color, rgba(255 255 255));
  --chatroom-message-owner-background-color: var(--yahoo-x-bv-player-chatroom-message-owner-background-color, rgba(255 82 13));

  /* reactions */
  --reaction-size: 60;

  --icon-play: path('M8 5v14l11-7z');
  --icon-pause: path('M6 19h4V5H6v14zm8-14v14h4V5h-4z');
  --icon-volume-up: path('M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z');
  --icon-volume-off: path('M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z');
  --icon-fullscreen: path('M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z');
  --icon-fullscreen-exit: path('M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z');
  --icon-share: path('M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z');
  --icon-replay: path('M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z');
  --icon-forward10: path('M18,14c0,3.3-2.7,6-6,6s-6-2.7-6-6,2.7-6,6-6v4l5-5-5-5v4c-4.4,0-8,3.6-8,8s3.6,8,8,8,8-3.6,8-8h-2ZM10.8,17v-4.3h0l-1.8.6v.7l1-.3v3.3h.8ZM12.2,14.5v.7c0,1.9,1.3,1.8,1.4,1.8s1.4,0,1.4-1.8v-.7c0-1.9-1.3-1.8-1.4-1.8s-1.4,0-1.4,1.8ZM14.3,14.4v1c0,.8-.2,1-.6,1s-.6-.3-.6-1v-1c0-.8.2-1,.6-1,.4,0,.6.3.6,1Z');
  --icon-replay10: path('M11.99,5V1l-5,5l5,5V7c3.31,0,6,2.69,6,6s-2.69,6-6,6s-6-2.69-6-6h-2c0,4.42,3.58,8,8,8s8-3.58,8-8S16.41,5,11.99,5z M10.89,16h-0.85v-3.26l-1.01,0.31v-0.69l1.77-0.63h0.09V16z M15.17,14.24c0,0.32-0.03,0.6-0.1,0.82s-0.17,0.42-0.29,0.57s-0.28,0.26-0.45,0.33s-0.37,0.1-0.59,0.1 s-0.41-0.03-0.59-0.1s-0.33-0.18-0.46-0.33s-0.23-0.34-0.3-0.57s-0.11-0.5-0.11-0.82V13.5c0-0.32,0.03-0.6,0.1-0.82 s0.17-0.42,0.29-0.57s0.28-0.26,0.45-0.33s0.37-0.1,0.59-0.1s0.41,0.03,0.59,0.1c0.18,0.07,0.33,0.18,0.46,0.33 s0.23,0.34,0.3,0.57s0.11,0.5,0.11,0.82V14.24z M14.32,13.38c0-0.19-0.01-0.35-0.04-0.48s-0.07-0.23-0.12-0.31 s-0.11-0.14-0.19-0.17s-0.16-0.05-0.25-0.05s-0.18,0.02-0.25,0.05s-0.14,0.09-0.19,0.17s-0.09,0.18-0.12,0.31 s-0.04,0.29-0.04,0.48v0.97c0,0.19,0.01,0.35,0.04,0.48s0.07,0.24,0.12,0.32s0.11,0.14,0.19,0.17s0.16,0.05,0.25,0.05 s0.18-0.02,0.25-0.05s0.14-0.09,0.19-0.17s0.09-0.19,0.11-0.32s0.04-0.29,0.04-0.48V13.38z');
  --icon-forward5: path('M17.95 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2zm-5.52 2.15c-.05.07-.11.13-.18.17s-.17.06-.27.06c-.17 0-.31-.05-.42-.15s-.17-.24-.19-.41h-.84c.01.2.05.37.13.53s.19.28.32.39.29.19.46.24.35.08.53.08c.24 0 .46-.04.64-.12s.33-.18.45-.31.21-.28.27-.45.09-.35.09-.54c0-.22-.03-.43-.09-.6s-.14-.33-.25-.45-.25-.22-.41-.28-.34-.1-.55-.1c-.07 0-.14.01-.2.02s-.13.02-.18.04-.1.03-.15.05-.08.04-.11.05l.11-.92h1.7v-.71H10.9l-.25 2.17.67.17c.03-.03.06-.06.1-.09s.07-.05.12-.07.1-.04.15-.05.13-.02.2-.02c.12 0 .22.02.3.05s.16.09.21.15.1.14.13.24.04.19.04.31-.01.22-.03.31-.06.17-.11.24z');
  --icon-replay5: path('M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.31 8.9l.25-2.17h2.39v.71h-1.7l-.11.92c.03-.02.07-.03.11-.05s.09-.04.15-.05.12-.03.18-.04.13-.02.2-.02c.21 0 .39.03.55.1s.3.16.41.28.2.27.25.45.09.38.09.6c0 .19-.03.37-.09.54s-.15.32-.27.45-.27.24-.45.31-.39.12-.64.12c-.18 0-.36-.03-.53-.08s-.32-.14-.46-.24-.24-.24-.32-.39-.13-.33-.13-.53h.84c.02.18.08.32.19.41s.25.15.42.15c.11 0 .2-.02.27-.06s.14-.1.18-.17.08-.15.11-.25.03-.2.03-.31-.01-.21-.04-.31-.07-.17-.13-.24-.13-.12-.21-.15-.19-.05-.3-.05c-.08 0-.15.01-.2.02s-.11.03-.15.05-.08.05-.12.07-.07.06-.1.09l-.67-.16z');
  --icon-pip: path('M2.4,11.4v-2H6L1.7,5.1l1.4-1.4L7.4,8V4.4h2v7H2.4z M4.4,20.4c-0.5,0-1-0.2-1.4-0.6c-0.4-0.4-0.6-0.9-0.6-1.4v-5h2v5h8v2 H4.4z M20.4,13.4v-7h-9v-2h9c0.5,0,1,0.2,1.4,0.6c0.4,0.4,0.6,0.9,0.6,1.4v7H20.4z M14.4,20.4v-5h8v5H14.4z');
  --icon-favorite-border: path('M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z');
  --icon-favorite: path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
  --icon-subtitles: path('M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z');
  --icon-subtitles-off: path('M20,4H6.8l2,2h11.2v11.2l1.8,1.8c.1-.3.2-.6.2-.9V6c0-1.1-.9-2-2-2ZM18,10h-5.2l2,2h3.2v-2ZM1,3.9l1.2,1.2c-.2.3-.2.6-.2.9v12c0,1.1.9,2,2,2h13.2l3,3,1.4-1.4L2.5,2.5l-1.4,1.4ZM4,6.8l3.2,3.2h-1.2v2h2v-1.2l3.2,3.2h-5.2v2h7.2l2,2H4V6.8Z');
  --icon-chevron-right: path('M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z');
  --icon-send: path('M2.01 21L23 12 2.01 3 2 10l15 2-15 2z');
  --icon-thumb-up: path('M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z');
  --icon-camera: path('M12,17.5c1.3,0,2.3-.4,3.2-1.3s1.3-1.9,1.3-3.2-.4-2.3-1.3-3.2-1.9-1.3-3.2-1.3-2.3.4-3.2,1.3-1.3,1.9-1.3,3.2.4,2.3,1.3,3.2,1.9,1.3,3.2,1.3ZM12,15.5c-.7,0-1.3-.2-1.8-.7s-.7-1.1-.7-1.8.2-1.3.7-1.8c.5-.5,1.1-.7,1.8-.7s1.3.2,1.8.7c.5.5.7,1.1.7,1.8s-.2,1.3-.7,1.8-1.1.7-1.8.7ZM4,21c-.6,0-1-.2-1.4-.6-.4-.4-.6-.9-.6-1.4V7c0-.6.2-1,.6-1.4s.9-.6,1.4-.6h3.2l1.9-2h6l1.9,2h3.2c.6,0,1,.2,1.4.6s.6.9.6,1.4v12c0,.6-.2,1-.6,1.4-.4.4-.9.6-1.4.6H4ZM4,19h16V7h-4.1l-1.8-2h-4.3l-1.8,2H4v12Z');

  /* yahoo logo */
  --yahoo-logo-display: none;
  --yahoo-logo: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNDUnIGhlaWdodD0nNDAnIGZpbGw9J25vbmUnPjxwYXRoIGZpbGw9JyNmZmYnIGZpbGwtcnVsZT0nZXZlbm9kZCcgZD0nbTk3LjM5MiA1LTUuOTE4IDE0LjUxMmg2LjYxTDEwNC4wMDMgNWgtNi42MVpNODkuNDYgMjQuNzIyYzAgMi4wMTQgMS41NDIgMy42NzYgMy42MiAzLjY3NiAyLjE0IDAgMy43NDctMS43MjYgMy43NDctMy44MDMgMC0yLjA0Ny0xLjU0My0zLjY3Ni0zLjYyLTMuNjc2LTIuMTQxIDAtMy43NDcgMS43NTctMy43NDcgMy44MDNabS01Ljk4MS00LjYwM2MwLTEuNzktMS4zMjItMy4yMjktMy4xNDgtMy4yMjlzLTMuMTQ4IDEuNDM5LTMuMTQ4IDMuMjNjMCAxLjc5IDEuMzIyIDMuMjI4IDMuMTQ4IDMuMjI4czMuMTQ4LTEuNDM4IDMuMTQ4LTMuMjI5Wm0tMTcuODE4IDBjMC0xLjc5LTEuMzIyLTMuMjI5LTMuMTQ4LTMuMjI5cy0zLjE0OCAxLjQzOS0zLjE0OCAzLjIzYzAgMS43OSAxLjMyMiAzLjIyOCAzLjE0OCAzLjIyOHMzLjE0OC0xLjQzOCAzLjE0OC0zLjIyOVptLTM4LjIxNyAzLjI5M2MtMS44NTcgMC0zLjI3My0xLjQzOS0zLjI3My0zLjI5M3MxLjQxNi0zLjI5MSAzLjI3My0zLjI5MWMxLjgyNiAwIDMuMjQzIDEuNDM3IDMuMjQzIDMuMjkxIDAgMS44NTQtMS40MTcgMy4yOTMtMy4yNDMgMy4yOTNaTS43OCAxMi4wOTZsNi43MzYgMTYuMTQyLTIuNDIzIDUuODE4aDUuOTE4bDguOTcyLTIxLjk2aC01Ljg4OGwtMy42NSA5LjM5Ny0zLjYyLTkuMzk3SC43OFptNzAuMTY5IDguMDIzYzAgNC43OTUtMy42MiA4LjQwNy04LjQzNyA4LjQwNy00LjgxNiAwLTguNDM2LTMuNjEyLTguNDM2LTguNDA3IDAtNC43OTQgMy42Mi04LjQwNiA4LjQzNi04LjQwNiA0LjgxNyAwIDguNDM3IDMuNjEyIDguNDM3IDguNDA2Wm0xNy44MTcgMGMwIDQuNzk1LTMuNjIgOC40MDctOC40MzYgOC40MDctNC44MTcgMC04LjQzNi0zLjYxMi04LjQzNi04LjQwNyAwLTQuNzk0IDMuNjE5LTguNDA2IDguNDM2LTguNDA2IDQuODE2IDAgOC40MzYgMy42MTIgOC40MzYgOC40MDZaTTM3LjggNXYyMy4xMWg1LjU3M3YtOC41MzRjMC0xLjY2My43ODYtMi42NTQgMi4wNDYtMi42NTQgMS4yMjcgMCAxLjkyLjg2NCAxLjkyIDIuNDYydjguNzI2aDUuNTcyVjE4LjA0MmMwLTMuOS0yLjA3OC02LjMzLTUuNDE1LTYuMzMtMS43OTQgMC0zLjE4LjcwNC00LjE1NSAxLjk1VjVoLTUuNTRabS03LjI0IDcuMDk2djEuNTAzYy0uODUtMS4xMi0yLjQyNC0xLjg4Ni00LjI1LTEuODg2LTQuMzEzIDAtNy41MjMgMy44NjctNy41MjMgOC40MDYgMCA0LjY2NyAzLjE3OSA4LjQwNyA3LjUyMyA4LjQwNyAxLjgyNiAwIDMuNC0uNzM1IDQuMjUtMS45MTh2MS41MDJoNS4zODRWMTIuMDk2SDMwLjU2WicgY2xpcC1ydWxlPSdldmVub2RkJy8+PG1hc2sgaWQ9J2EnIHdpZHRoPScxMDUnIGhlaWdodD0nMzAnIHg9JzAnIHk9JzUnIG1hc2tVbml0cz0ndXNlclNwYWNlT25Vc2UnIHN0eWxlPSdtYXNrLXR5cGU6bHVtaW5hbmNlJz48cGF0aCBmaWxsPScjZmZmJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIGQ9J205Ny4zOTIgNS01LjkxOCAxNC41MTJoNi42MUwxMDQuMDAzIDVoLTYuNjFaTTg5LjQ2IDI0LjcyMmMwIDIuMDE0IDEuNTQyIDMuNjc2IDMuNjIgMy42NzYgMi4xNCAwIDMuNzQ3LTEuNzI2IDMuNzQ3LTMuODAzIDAtMi4wNDctMS41NDMtMy42NzYtMy42Mi0zLjY3Ni0yLjE0MSAwLTMuNzQ3IDEuNzU3LTMuNzQ3IDMuODAzWm0tNS45ODEtNC42MDNjMC0xLjc5LTEuMzIyLTMuMjI5LTMuMTQ4LTMuMjI5cy0zLjE0OCAxLjQzOS0zLjE0OCAzLjIzYzAgMS43OSAxLjMyMiAzLjIyOCAzLjE0OCAzLjIyOHMzLjE0OC0xLjQzOCAzLjE0OC0zLjIyOVptLTE3LjgxOCAwYzAtMS43OS0xLjMyMi0zLjIyOS0zLjE0OC0zLjIyOXMtMy4xNDggMS40MzktMy4xNDggMy4yM2MwIDEuNzkgMS4zMjIgMy4yMjggMy4xNDggMy4yMjhzMy4xNDgtMS40MzggMy4xNDgtMy4yMjlabS0zOC4yMTcgMy4yOTNjLTEuODU3IDAtMy4yNzMtMS40MzktMy4yNzMtMy4yOTNzMS40MTYtMy4yOTEgMy4yNzMtMy4yOTFjMS44MjYgMCAzLjI0MyAxLjQzNyAzLjI0MyAzLjI5MSAwIDEuODU0LTEuNDE3IDMuMjkzLTMuMjQzIDMuMjkzWk0uNzggMTIuMDk2bDYuNzM2IDE2LjE0Mi0yLjQyMyA1LjgxOGg1LjkxOGw4Ljk3Mi0yMS45NmgtNS44ODhsLTMuNjUgOS4zOTctMy42Mi05LjM5N0guNzhabTcwLjE2OSA4LjAyM2MwIDQuNzk1LTMuNjIgOC40MDctOC40MzcgOC40MDctNC44MTYgMC04LjQzNi0zLjYxMi04LjQzNi04LjQwNyAwLTQuNzk0IDMuNjItOC40MDYgOC40MzYtOC40MDYgNC44MTcgMCA4LjQzNyAzLjYxMiA4LjQzNyA4LjQwNlptMTcuODE3IDBjMCA0Ljc5NS0zLjYyIDguNDA3LTguNDM2IDguNDA3LTQuODE3IDAtOC40MzYtMy42MTItOC40MzYtOC40MDcgMC00Ljc5NCAzLjYxOS04LjQwNiA4LjQzNi04LjQwNiA0LjgxNiAwIDguNDM2IDMuNjEyIDguNDM2IDguNDA2Wk0zNy44IDV2MjMuMTFoNS41NzN2LTguNTM0YzAtMS42NjMuNzg2LTIuNjU0IDIuMDQ2LTIuNjU0IDEuMjI3IDAgMS45Mi44NjQgMS45MiAyLjQ2MnY4LjcyNmg1LjU3MlYxOC4wNDJjMC0zLjktMi4wNzgtNi4zMy01LjQxNS02LjMzLTEuNzk0IDAtMy4xOC43MDQtNC4xNTUgMS45NVY1aC01LjU0Wm0tNy4yNCA3LjA5NnYxLjUwM2MtLjg1LTEuMTItMi40MjQtMS44ODYtNC4yNS0xLjg4Ni00LjMxMyAwLTcuNTIzIDMuODY3LTcuNTIzIDguNDA2IDAgNC42NjcgMy4xNzkgOC40MDcgNy41MjMgOC40MDcgMS44MjYgMCAzLjQtLjczNSA0LjI1LTEuOTE4djEuNTAyaDUuMzg0VjEyLjA5NkgzMC41NlonIGNsaXAtcnVsZT0nZXZlbm9kZCcvPjwvbWFzaz48ZyBtYXNrPSd1cmwoI2EpJz48cGF0aCBmaWxsPScjZmZmJyBkPSdNMCA1aDEwNHYzMEgweicvPjwvZz48cGF0aCBmaWxsPScjZmZmJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIGQ9J00xMTAuOTAyIDE4LjR2LTMuODUzaDIuMDc4VjEyLjU3aC0yLjA3OFY5aC0ydjMuNTdoLTIuNzQ1djEuOTc3aDIuNzQ1djQuNDk4Yy0xIC4zMjItMS44NjMuNTQ0LTIuOTAyLjc0NmwuMjk0IDIuMTk4YTU2LjI1NiA1Ni4yNTYgMCAwIDAgMi42MDgtLjc4NnY0LjA1NGMwIC4zNjMtLjExOC40ODQtLjQ3MS40ODRoLTJsLjMzNCAyLjE1OGgyLjYwOGMxLjEzNyAwIDEuNTI5LS42ODYgMS41MjktMS43NzV2LTUuNjQ3YTQ3LjY2OCA0Ny42NjggMCAwIDAgMi4xMTgtLjkwOGwtLjExOC0xLjkxNmMtLjY2Ny4yNjItMS4zMzMuNTA0LTIgLjc0NlptNi43ODQtOS4zNmEyMS4wMSAyMS4wMSAwIDAgMS0uNzY0IDIuNjgzaC0zLjIzNnYxNi4xMzZoMi4wMnYtMS4yMWg2LjAzOXYxLjIxaDIuMDJWMTEuNzIzaC00LjcyNmMuMjk0LS44MjcuNjA4LTEuNjU0Ljg0My0yLjUyMWwtMi4xOTYtLjE2MlptNC4wNTkgNC42MnY0LjMzNmgtNi4wMzl2LTQuMzM3aDYuMDM5Wm0wIDYuMTcxdjQuODgxaC02LjAzOXYtNC44OGg2LjAzOVptMTQuMTE4LTEwLjc5aC0yLjAzOXYuODQ2aC04LjA5OXYxLjQzMmg4LjA5OXYuODg4aC02Ljk2MXYxLjI1aDE2LjAzOXYtMS4yNWgtNy4wMzl2LS44ODhIMTQ0VjkuODg3aC04LjEzN1Y5LjA0Wk0xNDMgMTQuMTYzaC0xNi4yMzV2My4yNjdIMTQzdi0zLjI2OFptLTExLjQxMiAxLjA4OXYxLjA4OWgtMi45NjF2LTEuMDloMi45NjFabTQuNzY1IDB2MS4wODloLTIuOTh2LTEuMDloMi45OFptNC43NDUgMHYxLjA4OWgtMi45OHYtMS4wOWgyLjk4Wm0tMS41NjkgMTAuMTA1aDIuNDkxdi03LjIyMWgtMTQuMjk1djcuMjJoMi45MjJjLTEuNTY5LjU2Ni0zLjIzNS43NjctNC45MDIuODI4bC43NjUgMS43NTVjMS45NDEtLjIwMiA0LjEzNy0uNjg2IDUuOTAyLTEuNTc0bC0uODQzLTEuMDA4aDYuNjA3bC0uODIzIDEuMDY5YzIgLjQ2NCA0IC45NjggNS45NjEgMS41NzNsLjY4Ni0xLjYzNGE4MC4zMTIgODAuMzEyIDAgMCAwLTQuNDcxLTEuMDA4Wm0uNTEtNi4wMzF2Ljg4N2gtMTAuMzMzdi0uODg3aDEwLjMzM1ptMCAxLjg3NnYuOTA3aC0xMC4zMzN2LS45MDdoMTAuMzMzWm0wIDEuODk2di45NDhoLTEwLjMzM3YtLjk0OGgxMC4zMzNaJyBjbGlwLXJ1bGU9J2V2ZW5vZGQnLz48L3N2Zz4=) no-repeat 50% 50% / contain;

  /* emotions */
  --emotion-sign-1: var(
    --yahoo-x-bv-player-emotion-sign-1,
    url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0nI0ZDREExOScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI0ZGNEQ1MicgZD0nTTYuNDIzIDE0LjQxM2MuODEgMS4wNjggMi4wNyAxLjc4IDMuNjYyIDEuNzggMS42MzEgMCAyLjg5MS0uNjA3IDMuNzcyLTEuNjExYTQuODEgNC44MSAwIDAgMCAuNzI1LTEuMWMuMTEyLS4yMzQuMTgyLS40MjcuMjE5LS41NmExIDEgMCAwIDAtMS45MjgtLjUzbC0uMDEzLjAzN2EyLjgzOCAyLjgzOCAwIDAgMS0uNTEuODQ1Yy0uNTEyLjU4NC0xLjIzLjkzLTIuMjY1LjkzLS45MiAwLTEuNjEyLS4zOS0yLjA2NS0uOTg4YTEuMDA0IDEuMDA0IDAgMCAwLTEuNC0uMTk1Ljk5Ljk5IDAgMCAwLS4xOTcgMS4zOTJaJy8+PHBhdGggZmlsbD0nIzVGNUY1RicgZD0nTTkuNTI0IDYuMjk4Yy0uMTgyLS41OTMtLjczMi0uOTk0LTEuNDg2LS45OTRIMy44ODZjLTEuMTA0IDAtMS43Ny44Ni0xLjQ4OCAxLjkyMmwuMyAxLjEyOGMuMjgyIDEuMDYyIDEuNDA4IDEuOTIyIDIuNTE0IDEuOTIyaDEuNWMxLjEwNSAwIDIuMjMxLS44NiAyLjUxMy0xLjkyMmwuMDE4LS4wNjdoMi4xMDRsLjAxOC4wNjdjLjI4MiAxLjA2MSAxLjQwOCAxLjkyMiAyLjUxNCAxLjkyMmgxLjQ5OWMxLjEwNiAwIDIuMjMyLS44NiAyLjUxNC0xLjkyMmwuMy0xLjEyOGMuMjgyLTEuMDYyLS4zODQtMS45MjItMS40ODgtMS45MjJoLTQuMTUyYy0uNzU0IDAtMS4zMDMuNDAxLTEuNDg2Ljk5NEg5LjUyNFonLz48L3N2Zz4=)
  );
  --emotion-sign-2: var(
    --yahoo-x-bv-player-emotion-sign-2,
    url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0ndXJsKCNhKScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nIzVGNUY1RicgZD0nTTEzLjYzNiA2LjUxYy0uOTA0IDAtMS42MzYuNzI4LTEuNjM2IDEuNjI2IDAgLjkuNzMyIDEuNjI4IDEuNjM2IDEuNjI4LjkwNCAwIDEuNjM3LS43MjggMS42MzctMS42MjggMC0uODk4LS43MzMtMS42MjctMS42MzctMS42MjdaJy8+PHBhdGggZmlsbD0nI0ZGNEQ1MicgZD0nTTUuNTE5IDEzLjMyM2MuNjU2IDEuNzE1IDIuNDkgMi45NSA0LjY1MiAyLjk1IDIuMTYgMCAzLjk5NS0xLjIzNSA0LjY1MS0yLjk1LjI1OS0uNjc1LS4zLTEuMzktMS4wNC0xLjM5SDYuNTZjLS43NDEgMC0xLjMuNzE1LTEuMDQxIDEuMzlaJy8+PHBhdGggZmlsbD0nIzVGNUY1RicgZD0nTTcuMDkgOS43NjRjLjkwNSAwIDEuNjM3LS43MjggMS42MzctMS42MjggMC0uODk4LS43MzItMS42MjctMS42MzYtMS42MjctLjkwNCAwLTEuNjM2LjczLTEuNjM2IDEuNjI3IDAgLjkuNzMyIDEuNjI4IDEuNjM2IDEuNjI4WicvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0nYScgeDE9JzEyJyB4Mj0nLTEyJyB5MT0nLTEyJyB5Mj0nMTInIGdyYWRpZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJz48c3RvcCBzdG9wLWNvbG9yPScjRkVFRjM2Jy8+PHN0b3Agb2Zmc2V0PScxJyBzdG9wLWNvbG9yPScjRkNEQTE5Jy8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+)
  );
  --emotion-sign-3: var(
    --yahoo-x-bv-player-emotion-sign-3,
    url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0nI0ZDREExOScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI0ZDREExOScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI0ZGNEQ1MicgZD0nTTYgMTIuMjY1IDIuODg3IDkuMDIxYTIuMDQ1IDIuMDQ1IDAgMCAxIDAtMi43OTkgMS44NjYgMS44NjYgMCAwIDEgMS4zNTgtLjU4N2MxLjA2MiAwIDEuNTU4Ljg0MyAxLjc1NSAxLjAwMi4yMDMtLjE2NC42ODctMS4wMDIgMS43NTUtMS4wMDIuNTE0IDAgLjk5Ny4yMDkgMS4zNTguNTg3YTIuMDQ1IDIuMDQ1IDAgMCAxIDAgMi43OThMNiAxMi4yNjVaTTE1IDEyLjI2NWwtMy4xMTMtMy4yNDRhMi4wNDUgMi4wNDUgMCAwIDEgMC0yLjc5OSAxLjg2NiAxLjg2NiAwIDAgMSAxLjM1OC0uNTg3YzEuMDYzIDAgMS41NTguODQzIDEuNzU1IDEuMDAyLjIwMy0uMTY0LjY4Ny0xLjAwMiAxLjc1NS0xLjAwMi41MTQgMCAuOTk3LjIwOSAxLjM1OC41ODdhMi4wNDUgMi4wNDUgMCAwIDEgMCAyLjc5OEwxNSAxMi4yNjVaJy8+PHBhdGggZmlsbD0nIzVGNUY1RicgZD0nTTEyLjMzIDE0LjZhMiAyIDAgMSAxLTQgMCAyIDIgMCAwIDEgNCAwWicvPjwvc3ZnPg==)
  );
  --emotion-sign-4: var(
    --yahoo-x-bv-player-emotion-sign-4,
    url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0ndXJsKCNhKScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI2ZmZicgZD0nTTE1IDQuNjRjLTIuMDI3IDAtMy42NjcgMS42MzQtMy42NjcgMy42NDdBMy42NTUgMy42NTUgMCAwIDAgMTUgMTEuOTMzYzIuMDI0IDAgMy42NjctMS42MyAzLjY2Ny0zLjY0NiAwLTIuMDEzLTEuNjQzLTMuNjQ2LTMuNjY3LTMuNjQ2Wk02IDQuNjRjLTIuMDI2IDAtMy42NjcgMS42MzQtMy42NjcgMy42NDdBMy42NTUgMy42NTUgMCAwIDAgNiAxMS45MzNjMi4wMjQgMCAzLjY2Ny0xLjYzIDMuNjY3LTMuNjQ2IDAtMi4wMTMtMS42NDMtMy42NDYtMy42NjctMy42NDZaJy8+PHBhdGggZmlsbD0nIzVGNUY1RicgZD0nTTE0Ljk3IDkuODg0Yy45MDQgMCAxLjYzNi0uNzI4IDEuNjM2LTEuNjI3IDAtLjg5OC0uNzMyLTEuNjI3LTEuNjM2LTEuNjI3LS45MDUgMC0xLjYzNy43MjktMS42MzcgMS42MjcgMCAuOS43MzIgMS42MjcgMS42MzcgMS42MjdaTTUuOTcgOS44ODRjLjkwNCAwIDEuNjM2LS43MjggMS42MzYtMS42MjcgMC0uODk4LS43MzItMS42MjctMS42MzYtMS42MjctLjkwNSAwLTEuNjM3LjcyOS0xLjYzNyAxLjYyNyAwIC45LjczMiAxLjYyNyAxLjYzNyAxLjYyN1onLz48cGF0aCBmaWxsPScjRkY0RDUyJyBkPSdNOC4zMzMgMTMuOTM0YTIgMiAwIDEgMSA0IDB2My42MjRhMiAyIDAgMCAxLTQgMHYtMy42MjRaJy8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSdhJyB4MT0nMTInIHgyPSctMTInIHkxPSctMTInIHkyPScxMicgZ3JhZGllbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnPjxzdG9wIHN0b3AtY29sb3I9JyNGRUVGMzYnLz48c3RvcCBvZmZzZXQ9JzEnIHN0b3AtY29sb3I9JyNGQ0RBMTknLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=)
  );
  --emotion-sign-5: var(
    --yahoo-x-bv-player-emotion-sign-5,
    url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0nI0ZDREExOScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI0ZDREExOScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nIzVGNUY1RicgZD0nTTEyLjY0MyA2LjM4OWEuOTk0Ljk5NCAwIDAgMSAxLjQtLjEyM2wyLjA1MiAxLjcyMWEuOTk0Ljk5NCAwIDEgMS0xLjI3OCAxLjUyNEwxMi43NjUgNy43OWEuOTk0Ljk5NCAwIDAgMS0uMTIyLTEuNDAxWk04LjIxOCA2LjM4OWEuOTk0Ljk5NCAwIDAgMC0xLjQwMS0uMTIzTDQuNzY1IDcuOTg3YS45OTQuOTk0IDAgMCAwIDEuMjc5IDEuNTI0TDguMDk1IDcuNzlhLjk5NC45OTQgMCAwIDAgLjEyMy0xLjQwMVonLz48cGF0aCBmaWxsPScjRkY0RDUyJyBkPSdNMTIuMzcgMTUuNzg2YzEuMTY3IDAgMi4wMDUtLjU2MiAyLjQ1NS0xLjQ0NmEzLjIzNCAzLjIzNCAwIDAgMCAuMzQ1LTEuMzMyLjk5Ny45OTcgMCAwIDAtLjk4Mi0xLjAxMy45OTcuOTk3IDAgMCAwLTEuMDE4Ljk3NmMtLjAwMS4wODktLjAzOC4yOS0uMTMuNDctLjEyMy4yNDMtLjI5Mi4zNTYtLjY3LjM1Ni0uNCAwLS42MTUtLjEzNi0uNzc3LS40MWExLjM5MiAxLjM5MiAwIDAgMS0uMTgtLjQ5OGMtLjEyLTEuMTgyLTEuODQ3LTEuMTk3LTEuOTg4LS4wMTYtLjAxMS4wOTktLjA3LjMxMS0uMTkuNTEtLjE2NS4yNzgtLjM3OC40MTQtLjc1Ny40MTQtLjM1MyAwLS41MjUtLjEyLS42Ni0uMzg2YTEuNTE4IDEuNTE4IDAgMCAxLS4xNTItLjUyOC45OTguOTk4IDAgMCAwLTEuMDQ1LS45NDguOTk3Ljk5NyAwIDAgMC0uOTUzIDEuMDM4IDMuNDY4IDMuNDY4IDAgMCAwIC4zNjUgMS4zMzZjLjQ1Ny44OTggMS4yODcgMS40NzcgMi40NDUgMS40NzcuNzkzIDAgMS40NDMtLjI2NSAxLjkzNS0uNzE2LjQ5NS40NTIgMS4xNTIuNzE2IDEuOTU2LjcxNlonLz48cGF0aCBmaWxsPScjRkY0RDUyJyBkPSdNMSAxMS42MDVjMC0uNzMyLjU5My0xLjMyNSAxLjMyNS0xLjMyNWgxLjM1YTEuMzI1IDEuMzI1IDAgMSAxIDAgMi42NWgtMS4zNUExLjMyNSAxLjMyNSAwIDAgMSAxIDExLjYwNVpNMTYuMzMgMTEuNjA1YzAtLjczMi41OTMtMS4zMjUgMS4zMjUtMS4zMjVoMS4zNWExLjMyNSAxLjMyNSAwIDEgMSAwIDIuNjVoLTEuMzVhMS4zMjUgMS4zMjUgMCAwIDEtMS4zMjUtMS4zMjVaJyBvcGFjaXR5PScuMycvPjwvc3ZnPg==)
  );
  --emotion-sign-6: var(
    --yahoo-x-bv-player-emotion-sign-6,
    url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0nI0ZDREExOScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI0ZGNEQ1MicgZD0nTTcgMTUuMmMwLTEuMTA1Ljg5LTIgMS45ODgtMmg0LjAyNGMxLjA5OCAwIDEuOTg4Ljg5NSAxLjk4OCAycy0uODkgMi0xLjk4OCAySDguOTg4QTEuOTk0IDEuOTk0IDAgMCAxIDcgMTUuMlonLz48cGF0aCBmaWxsPScjZmZmJyBkPSdNNS43MyA1LjM2Yy4xMy0uNDguODA5LS40OC45MzggMGwuNjY2IDIuNDY4IDIuMDc0LjQxNmMuNTIuMTA0LjUyLjg0OCAwIC45NTJsLTIuMDc0LjQxNi0uNjY2IDIuNDY5Yy0uMTMuNDc5LS44MDkuNDc5LS45MzggMGwtLjY2Ni0yLjQ3LTIuMDc0LS40MTVjLS41Mi0uMTA0LS41Mi0uODQ4IDAtLjk1MmwyLjA3NC0uNDE2LjY2Ni0yLjQ2OVpNMTUuMTMgNS4zNmMuMTMtLjQ4LjgwOS0uNDguOTM4IDBsLjY2NiAyLjQ2OCAyLjA3NC40MTZjLjUyLjEwNC41Mi44NDggMCAuOTUybC0yLjA3NC40MTYtLjY2NiAyLjQ2OWMtLjEzLjQ3OS0uODA5LjQ3OS0uOTM4IDBsLS42NjYtMi40Ny0yLjA3NC0uNDE1Yy0uNTItLjEwNC0uNTItLjg0OCAwLS45NTJsMi4wNzQtLjQxNi42NjYtMi40NjlaJy8+PC9zdmc+)
  );
  --emotion-sign-7: var(
    --yahoo-x-bv-player-emotion-sign-7,
    url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0ndXJsKCNhKScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI2ZmZicgZmlsbC1ydWxlPSdldmVub2RkJyBkPSdtMTguMTkxIDExLjY4OC0uMTY2LjE1NC4wOTQuMjA1Yy4wOC4xNzQuMTIzLjM3LjEyMy41NjYgMCAuMzY3LS4xNjcuNjU0LS40OTYuODUzbC0uMjQ2LjE1LjEyNy4yNTZjLjA4NS4xNzIuMTI4LjM1OC4xMjguNTUgMCAuMzMtLjE2LjU5Ni0uNDg2LjgxNWwtLjIyNy4xNS4xMTcuMjQ1Yy4wNzguMTYyLjExNy4zNDQuMTE3LjU0IDAgLjkwNi0uNzM4IDEuMjYxLTEuMzcgMS4yNjFsLTcuMzg2LjAwN1Y5LjljLjAyMi0uMDM0LjAzNy0uMDYuMDUtLjA4My4wMy0uMDUuMDUtLjA4NS4xMTQtLjE1OC40MjQtLjM2LjgxNC0uNzI1IDEuMTYxLTEuMDg1LjA5Ni0uMS4xOS0uMi4yOC0uMzAxLjc3LS44NTIgMS4wNTItMS41MjUgMS4wMDktMi40YS44NDYuODQ2IDAgMCAxIC4yODgtLjY5M2MuMjY3LS4yMzcuNjc0LS4zMzcgMS4wODktLjI3My43OC4xMjMgMS4zNDIuNzYgMS40NjQgMS42NjMuMTIuODgzLjA1OCAxLjc0Ny0uMTc0IDIuNDMybC0uMTQuNDEzaDMuMjZjLjgyOCAwIDEuNzIyLjUxNCAxLjcyMiAxLjM0NCAwIC4zMy0uMTYuNjYtLjQ1Mi45M1ptLTEyLjgzNCA2LjA2LjAwNi03LjUyOWMwLS4xNjguMTE1LS4zMTMuMzEtLjMxM2gxLjU4MnY4LjE1M0g1LjY3M2EuMzA0LjMwNCAwIDAgMS0uMzE2LS4zMTJaJyBjbGlwLXJ1bGU9J2V2ZW5vZGQnLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2EnIHgxPScxNC4zNzInIHgyPSczNC41NDInIHkxPSczMS4xNycgeTI9JzEwLjA4NScgZ3JhZGllbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnPjxzdG9wIHN0b3AtY29sb3I9JyMzQUJGQkEnLz48c3RvcCBvZmZzZXQ9JzEnIHN0b3AtY29sb3I9JyNGQ0RBMTknLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=)
  );
  --emotion-sign-8: var(
    --yahoo-x-bv-player-emotion-sign-8,
    url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0ndXJsKCNhKScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI2ZmZicgZD0nbTEyIDE4LjktNS45NDMtNi4xNzdjLTEuNDEtMS40NjktMS40MS0zLjg1OCAwLTUuMzI2YTMuNTcgMy41NyAwIDAgMSA1LjE4NSAwbC43NTguNzkuNzU3LS43OWEzLjU2OCAzLjU2OCAwIDAgMSA1LjE4NyAwYzEuNDA4IDEuNDY4IDEuNDA4IDMuODU3IDAgNS4zMjVMMTIgMTguOVonLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2EnIHgxPScxMS45NzQnIHgyPSczNS45MjInIHkxPSczNS45NzQnIHkyPScxMi4wMjYnIGdyYWRpZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJz48c3RvcCBzdG9wLWNvbG9yPScjRkY0RDUyJy8+PHN0b3Agb2Zmc2V0PScxJyBzdG9wLWNvbG9yPScjRkY4QTAwJy8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+)
  );
  --emotion-sign-9: var(
    --yahoo-x-bv-player-emotion-sign-9,
    url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0ndXJsKCNhKScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI2ZmZicgZD0nTTUuMjE0IDExLjY0OEg3Ljg3VjguNzJoMS43NDR2Mi45MjhoMi42NzJ2MS42NDhIOS42MTR2Mi45MTJINy44N3YtMi45MTJINS4yMTR2LTEuNjQ4Wk0xNS43NDYgMThWOS4xODRsLTIuMjQgMS4zNzYtLjA5Ni0uMDMyVjguNDk2bDIuOTI4LTEuNzc2aDEuODcyVjE4aC0yLjQ2NFonLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2EnIHgxPScxMS45NzQnIHgyPSczNS45MjInIHkxPSczNS45NzQnIHkyPScxMi4wMjYnIGdyYWRpZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJz48c3RvcCBzdG9wLWNvbG9yPScjRkY4QTAwJy8+PHN0b3Agb2Zmc2V0PScuNTknIHN0b3AtY29sb3I9JyNGRkE3MDAnLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=)
  );

  position: relative;
  inline-size: 100%;
  block-size: 100%;
  overflow: hidden;
  outline: 0 none;
  background-color: rgba(0 0 0);

  container-type: inline-size;

  &[data-fullscreen=true] {
    position: fixed;
    inset: 0;
    z-index: 2147483647;

    #button-fullscreen {
      --before-scale: 0;
      --after-scale: var(--button-icon-scale-basis);
    }
  }

  /* safe area */
  &:fullscreen,
  &[data-fullscreen=true] {
    .host,
    .chatroom {
      --padding-inline: max(var(--padding-inline-basis), var(--safe-area-left));
      --padding-block-start: max(var(--padding-block-start-basis), var(--safe-area-top));
    }

    .cancel-refreshing {
      --padding-inline: max(var(--padding-inline-basis), var(--safe-area-left));
      --padding-block-end: max(var(--padding-block-end-basis), var(--safe-area-bottom));
    }

    .preview {
      --padding-inline: max(var(--padding-inline-basis), var(--safe-area-right));
    }

    .controls,
    .live-controls,
    .chatroom {
      --padding-inline: max(var(--padding-inline-basis), var(--safe-area-left), var(--safe-area-right));
      --padding-block-end: max(var(--padding-block-end-basis), var(--safe-area-bottom));
    }

    .chatroom {
      --chatroom-max-inline-size: calc(100% * 2 / 3);
    }

    .live-controls {
      --emotion-float-ratio: 6;
    }
  }

  &[data-mode=clear] {
    --control-axis-y: 100%;
  }

  &.main--refreshing {
    --refreshing-axis-inline-start: -100%;
    --refreshing-axis-inline-end: 100%;
    --refreshing-axis-block-start: -100%;
    --refreshing-axis-block-end: 100%;
    --refreshing-button-scale: 1;
    --refreshing-button-pointer-events: auto;
  }

  &[data-type=live] {
    --LIVE: var(--ON);
    --REPLAY: var(--OFF);
  }

  &[data-type=replay] {
    --LIVE: var(--OFF);
    --REPLAY: var(--ON);
  }

  @container (width > 767px) {
    .host,
    .chatroom {
      --host-avatar-size: 40;
      --host-name-font-size: 14px;
      --host-count-font-size: 12px;
    }

    .controls,
    .live-controls,
    .chatroom {
      --slider-thumb-size: 20px;
      --indicator-block-size: calc(var(--slider-thumb-size) * .35);
    
      --time-info-text-size: 18px;
      --button-size: 40;
    }

    .live-controls {
      --live-controls-input-font-size: 16px;
    }

    .preview {
      --preview-image-size: 100px;
    }
    
    .cancel-refreshing {
      --button-size: 40;
    }

    .reactions {
      --reaction-size: 70;
    }
  }

  .video-container {
    inline-size: 100%;
    block-size: 100%;
    
    > * {
      position: relative;
      inline-size: 100%;
      block-size: 100%;

      > *:not(:has(video)) {
        display: none;
      }

      > *:has(video) {
        position: relative;
        inline-size: 100%;
        block-size: 100%;
      }
    }

    video {
      inline-size: 100%;
      block-size: 100%;
      display: block;
      object-fit: var(--video-object-fit);
      outline: 0 none;
      background-color: rgba(0 0 0);

      &::backdrop {
        background-color: rgba(0 0 0);
      }
    }
  }

  .scenes {
    .host {
      --avatar-size: calc(var(--host-avatar-size) * 1px);
      --host-block-size: calc(var(--avatar-size) + var(--host-avatar-padding) * 2);

      position: absolute;
      inset-inline-start: 0;
      inset-block-start: 0;
      padding-inline-start: var(--padding-inline);
      padding-block-start: var(--padding-block-start);

      translate: 0 var(--refreshing-axis-block-start);
      transition: translate var(--refreshing-animation-duration) var(--refreshing-animation-timing-function);
      will-change: translate;

      .host__ens {
        --button-size: var(--host-avatar-size);
        --button-size-with-unit: calc(var(--button-size) * 1px);
        --button-icon-scale-basis: calc((var(--button-size) * .75) / 24);

        block-size: var(--host-block-size);
        padding: var(--host-avatar-padding);
        background-color: rgba(0 0 0/.8);
        border-radius: var(--host-block-size);
        box-sizing: border-box;
        display: flex;
        gap: var(--host-avatar-padding);
        align-items: center;
        outline: 0 none;
      }

      .host__ens__avatar {
        flex-shrink: 0;
        inline-size: var(--avatar-size);
        aspect-ratio: 1/1;
        border-radius: var(--avatar-size);
        display: block;
        object-fit: cover;
      }

      .host__ens__info {
        min-inline-size: 0;
        max-inline-size: 120px;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .host__ens__info__name {
          font-size: var(--host-name-font-size);
          line-height: 1;
          color: rgba(255 255 255);
        }

        .host__ens__count {
          font-size: var(--host-count-font-size);
          color: rgba(var(--gandalf));
          
          &::after {
            content: ' ' var(--host-count-text);
          }
        }
      }

      .button--follow {
        --before-icon: var(--icon-favorite-border);
        --after-icon: var(--icon-favorite);

        &::after {
          --button-icon-color: rgba(var(--solo-cup));
        }
      }
    }

    .chatroom {
      --inset-block-end:
        var(
          --REPLAY,
          calc(
            var(--padding-block-end)
            + var(--button-size) * 1px
            + var(--slider-thumb-size)
          )
        )
        var(
          --LIVE,
          calc(
            var(--padding-block-end)
            + var(--button-size) * 1px
          )
        );
      
      --block-size-basis: calc(
        100% 
        - var(--padding-block-start) 
        - var(--inset-block-end) 
        - (var(--host-avatar-size) * 1px) 
        - (var(--host-avatar-padding) * 2) 
        - 16px
      );

      --block-size: calc(var(--block-size-basis) * 2 / 3);

      --gap: 1em;
      --mask-vertical-size: var(--gap);
      --mask-vertical: linear-gradient(
        to bottom,
        transparent 0%,
        black calc(0% + var(--mask-vertical-size)),
        black calc(100% - var(--mask-vertical-size)),
        transparent 100%
      );

      position: absolute;
      inset-inline-start: 0;
      inset-block-end: var(--chatroom-inset-block-end);
      inset-block-end: var(--inset-block-end);

      inline-size: var(--chatroom-max-inline-size);
      block-size: var(--block-size);
      max-block-size: var(--chatroom-max-block-size);

      padding-inline-start: var(--padding-inline);
      pointer-events: none;

      translate: var(--refreshing-axis-inline-start) 0;
      transition: translate var(--refreshing-animation-duration) var(--refreshing-animation-timing-function);
      will-change: translate;

      .auto-scroll {
        inline-size: fit-content;
        block-size: 100%;

        padding-block: var(--gap);
        box-sizing: border-box;
        pointer-events: auto;

        display: flex;
        flex-direction: column-reverse;

        overflow: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;

        box-sizing: border-box;
        mask-image: var(--mask-vertical);
        -webkit-mask-image: var(--mask-vertical);

        /* scroll */
        scrollbar-width: none;
        overflow-anchor: none;

        &::-webkit-scrollbar {
          display: none;
        }
      }

      .chatroom__messages {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }

      .chatroom__messages__unit {
        --color: rgba(255 255 255);
        --background-color: rgba(0 0 0/.45);
        --host-color: color-mix(in srgb, rgba(255 211 51) 60%, rgba(255 255 255));

        font-size: .875em;
        color: var(--color);
        background-color: var(--background-color);
        line-height: 1.3;
        padding: 3px 12px;
        border-radius: 16px;
        hyphens: auto;
        word-break: break-all;

        &.chatroom__messages__unit--rushbuying {
          --color: rgba(35 42 49);
          --background-color: rgba(252 218 25);
          --host-color: rgba(35 42 49);

          .chatroom__messages__unit__host {
            padding-inline-end: 0;

            &::before {
              content: '《';
            }

            &::after {
              content: '》';
            }
          }
        }

        &.chatroom__messages__unit--announce {
          --line-height: 20px;

          line-height: var(--line-height);

          &::before {
            content: '';
            block-size: var(--line-height);
            aspect-ratio: 1.5/1;
            background-color: rgba(255 0 0);
            border-radius: var(--line-height);
            display: block;
            float: inline-start;
            margin-inline-end: 4px;
            background: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0cHgiIGZpbGw9IiNmZmZmZmYiPjxnPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iMjQiIHdpZHRoPSIyNCIvPjwvZz48cGF0aCBkPSJNMTgsMTFjMCwwLjY3LDAsMS4zMywwLDJjMS4yLDAsMi43NiwwLDQsMGMwLTAuNjcsMC0xLjMzLDAtMkMyMC43NiwxMSwxOS4yLDExLDE4LDExeiIvPjxwYXRoIGQ9Ik0xNiwxNy42MWMwLjk2LDAuNzEsMi4yMSwxLjY1LDMuMiwyLjM5YzAuNC0wLjUzLDAuOC0xLjA3LDEuMi0xLjZjLTAuOTktMC43NC0yLjI0LTEuNjgtMy4yLTIuNCBDMTYuOCwxNi41NCwxNi40LDE3LjA4LDE2LDE3LjYxeiIvPjxwYXRoIGQ9Ik0yMC40LDUuNkMyMCw1LjA3LDE5LjYsNC41MywxOS4yLDRjLTAuOTksMC43NC0yLjI0LDEuNjgtMy4yLDIuNGMwLjQsMC41MywwLjgsMS4wNywxLjIsMS42IEMxOC4xNiw3LjI4LDE5LjQxLDYuMzUsMjAuNCw1LjZ6Ii8+PHBhdGggZD0iTTQsOWMtMS4xLDAtMiwwLjktMiwydjJjMCwxLjEsMC45LDIsMiwyaDF2NGgydi00aDFsNSwzVjZMOCw5SDR6IE05LjAzLDEwLjcxTDExLDkuNTN2NC45NGwtMS45Ny0xLjE4TDguNTUsMTNIOEg0di0yaDQgaDAuNTVMOS4wMywxMC43MXoiLz48cGF0aCBkPSJNMTUuNSwxMmMwLTEuMzMtMC41OC0yLjUzLTEuNS0zLjM1djYuNjlDMTQuOTIsMTQuNTMsMTUuNSwxMy4zMywxNS41LDEyeiIvPjwvc3ZnPg==") rgba(15 105 255) no-repeat 50% 50%/contain;
          }
        }

        &[data-admin=y]::before {
          --block-size: 18px;

          block-size: var(--block-size);
          content: var(--chatroom-message-owner-text);
          color: var(--chatroom-message-owner-text-color);
          font-size: 12px;
          padding-inline: 6px;
          border-radius: var(--block-size);
          background-color: var(--chatroom-message-owner-background-color);
          display: inline-flex;
          align-items: center;
          position: relative;
          inset-block-start: -1px;
        }

        .chatroom__messages__unit__host {
          color: var(--host-color);
          padding-inline-end: 4px;
        }

        &[data-active] {
          --leaping-scale: 1.1;

          animation: leaping 300ms ease;
        }
      }
    }

    .preview {
      position: absolute;
      inset-inline-end: 0;
      inset-block-start: var(--preview-inset-block-start);

      inline-size: fit-content;
      block-size: fit-content;
      padding-inline-end: var(--padding-inline);

      translate: var(--refreshing-axis-block-end) 0;
      transition: translate var(--refreshing-animation-duration) var(--refreshing-animation-timing-function);
      will-change: translate;

      .preview__trigger {
        appearance: none;
        font-size: 0;
        appearance: none;
        box-shadow: unset;
        border: unset;
        background: transparent;
        -webkit-user-select: none;
        user-select: none;
        pointer-events: auto;
        margin: 0;
        padding: 0;
        outline: 0 none;

        position: relative;
        inline-size: var(--preview-image-size);
        border: 4px solid var(--preview-background-color);
        border-radius: 12px;
        background-color: var(--preview-background-color);
        box-shadow: 0 0 0 1px var(--preview-border-color);

        &::before {
          position: absolute;
          inset-inline-start: 0;
          inset-block-start: 0;
          color: rgba(255 255 255);
          background-color: rgba(0 0 0/.8);
          padding-inline: 6px;
          line-height: 1.5;
          content: '#' attr(data-serial-no);
          font-size: 12px;
          z-index: 1;
          border-end-end-radius: 8px;
        }

        img {
          --mask-vertical: linear-gradient(
            to bottom,
            black 0%,
            black calc(100% - 20px),
            transparent 100%
          );

          inline-size: 100%;
          aspect-ratio: 1/1;
          object-fit: cover;
          border-radius: 10px;

          mask-image: var(--mask-vertical);
          -webkit-mask-image: var(--mask-vertical);
        }

        span {
          --block-size: 20px;

          inline-size: 100%;
          block-size: var(--block-size);
          border-radius: var(--block-size);
          background-color: var(--preview-button-background-color);
          color: var(--preview-button-color);
          line-height: var(--block-size);
          text-align: center;
          display: block;
          margin-inline: auto;
          font-size: 12px;
          margin-block: 2px;
        }
      }
    }

    .cancel-refreshing {
      --button-size-with-unit: calc(var(--button-size) * 1px);
      --button-icon-scale-basis: calc((var(--button-size) * .75) / 24);

      --refreshing-animation-duration: 200ms;

      position: absolute;
      inset-inline-start: 0;
      inset-block-end: 0;
      padding-inline-start: var(--padding-inline);
      padding-block-end: var(--padding-block-end);
      pointer-events: var(--refreshing-button-pointer-events);

      .button--cancel-refreshing {
        --before-icon: var(--icon-subtitles);
        --after-icon: var(--icon-subtitles-off);

        border-radius: var(--button-size-with-unit);
        background-color: var(--button-focus-visible-color);
        box-shadow: 0 0 0 2px var(--button-focus-visible-color);

        scale: var(--refreshing-button-scale);
        transition: scale var(--refreshing-animation-duration) var(--refreshing-animation-timing-function);
        will-change: scale;
      }
    }

    .poster {
      --opacity: 1;

      position: absolute;
      inset: 0;
      inline-size: 100%;
      block-size: 100%;
      background-color: var(--poster-background-color);
      object-fit: contain;
      pointer-events: none;
      opacity: var(--opacity);
      transition: opacity 1s ease;
      will-change: opacity;

      &[hidden] {
        --opacity: 0;

        display: block;
      }
    }

    .controls {
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      box-sizing: border-box;
      padding-inline: var(--padding-inline);
      padding-block-end: var(--padding-block-end);
      background: linear-gradient(0deg, rgba(0 0 0/.7), transparent 90%);
      display: var(--LIVE, none) var(--REPLAY, block); 

      translate: 0 var(--refreshing-axis-block-end);
      transition: translate var(--refreshing-animation-duration) var(--refreshing-animation-timing-function);
      will-change: translate;

      .progress-wrap {
        flex-grow: 1;
        position: relative;

        .progress__input {
          position: relative;
          appearance: none;
          inline-size: 100%;
          display: block;
          outline: 0 none;
          cursor: pointer;
          background: transparent;
          z-index: 1;

          /* webkit */
          &::-webkit-slider-thumb {
            appearance: none;
            inline-size: var(--slider-thumb-size);
            aspect-ratio: 1/1;
            border: 0 none;
            border-radius: var(--slider-thumb-size);
            background: var(--slider-thumb-color);
            scale: var(--slider-thumb-scale);
            transition: scale 100ms ease;
            will-change: scale;
            transform-origin: 50% 50%;
            box-shadow: 0 0 2px var(--slider-thumb-shadow-color);
          }

          &:active::-webkit-slider-thumb {
            --slider-thumb-scale: var(--slider-thumb-active-scale);
          }

          &::-webkit-slider-runnable-track {
            background: transparent;
          }

          /* moz */
          &::-moz-focus-outer {
            border:0 none;
          }

          &::-moz-range-thumb {
            appearance: none;
            inline-size: var(--slider-thumb-size);
            block-size: var(--slider-thumb-size);
            border: 0 none;
            border-radius: var(--slider-thumb-size);
            background: var(--slider-thumb-color);
            scale: var(--slider-thumb-scale);
            transition: scale 100ms ease;
            will-change: scale;
            transform-origin: 50% 50%;
            box-shadow: 0 0 2px var(--slider-thumb-shadow-color);
          }

          &:active::-moz-range-thumb {
            --slider-thumb-scale: var(--slider-thumb-active-scale);
          }

          &::-moz-range-track {
            background: transparent;
            block-size: var(--slider-thumb-size);
          }
        }

        .progress__indicators {
          --background: linear-gradient(to right,var(--indicator-buffer-start),var(--indicator-buffer-end)) no-repeat 0 / 100%;

          position: absolute;
          inset: 0;
          block-size: var(--indicator-block-size);
          border-radius: var(--indicator-block-size);
          background-color: var(--indicator-background);
          margin-block: auto;
          overflow: hidden;
          pointer-events: none;
          transition: transform 200ms ease;
          transform: scaleY(var(--indicator-scale));
          will-change: transform;

          .progress__indicator {
            position: absolute;
            inset-inline-start: 0;
            inset-block-start: 0;
            appearance: none;
            inline-size: 100%;
            block-size: var(--indicator-block-size);
            background: transparent;
            border: 0 none;
            outline: 0 none;

            &.progress__indicator--duration {
              --background: linear-gradient(to right,var(--indicator-duration-start),var(--indicator-duration-end)) no-repeat 0 / 100%
            }

            /* webkit */
            &::-webkit-progress-bar {
              background: transparent;
            }

            &::-webkit-progress-value {
              background: var(--background);
              border-radius: var(--indicator-block-size);
            }

            /* moz */
            &::-moz-progress-bar {
              background: var(--background);
              border-radius: var(--indicator-block-size);
            }
          }
        }
      }

      .actions {
        --button-size-with-unit: calc(var(--button-size) * 1px);
        --button-icon-scale-basis: calc((var(--button-size) * .75) / 24);

        inline-size: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .actions__part {
          inline-size: 50%;
          display: flex;
          gap: 2px;
          align-items: center;

          &.actions__part--end {
            justify-content: flex-end;
          }

          .time-information {
            font-size: var(--time-info-text-size);
            color: var(--time-info-text-color);
            white-space: nowrap;
            display: flex;
            gap: 4px;
            -webkit-user-select: none;
            user-select: none;

            em {
              min-inline-size: 32px;
              text-align: center;
            }
          }
          .yahoo-logo {
            aspect-ratio: 3.625/1;
            block-size: var(--button-size-with-unit);
            display: block;
            background: var(--yahoo-logo);
            display: var(--yahoo-logo-display);
          }
        }
      }
    }

    .live-controls {
      --gap: 2px;
      --button-count: 4;

      --button-expand-opacity: 0;
      --button-expand-pointer-events: none;
      --button-others-opacity: 1;
      --button-others-pointer-events: auto;

      --button-size-with-unit: calc(var(--button-size) * 1px);
      --button-icon-scale-basis: calc((var(--button-size) * .75) / 24);
      --buttons-inline-size-normal: calc(var(--button-size-with-unit) * var(--button-count) + var(--gap) * (var(--button-count) - 1));
      --buttons-inline-size-active: var(--button-size-with-unit);
      --buttons-inline-size: var(--buttons-inline-size-normal);
      --buttons-overflow: visible;

      &:has(.live-controls__buttons .button:nth-of-type(4)) {
        --button-count: 3;
      }

      &:has(.live-controls__buttons .button:nth-of-type(5)) {
        --button-count: 4;
      }

      &:has(.live-controls__buttons .button:nth-of-type(6)) {
        --button-count: 5;
      }

      &:has(.live-controls__buttons .button:nth-of-type(7)) {
        --button-count: 6;
      }

      &:has(.live-controls__form__input:focus) {
        --button-expand-opacity: 1;
        --button-expand-pointer-events: auto;
        --button-others-opacity: 0;
        --button-others-pointer-events: none;
        --buttons-inline-size: var(--buttons-inline-size-active);

        --buttons-overflow: hidden;
      }

      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      box-sizing: border-box;
      padding-inline: var(--padding-inline);
      padding-block-end: var(--padding-block-end);
      background: linear-gradient(0deg, rgba(0 0 0/.7), transparent 90%);
      gap: var(--gap);
      align-items: center;
      display: var(--LIVE, flex) var(--REPLAY, none); 

      translate: 0 var(--refreshing-axis-block-end);
      transition: translate var(--refreshing-animation-duration) var(--refreshing-animation-timing-function);
      will-change: translate;

      .live-controls__buttons {
        flex-shrink: 0;
        position: relative;
        inline-size: var(--buttons-inline-size);
        display: flex;
        gap: var(--gap);

        overflow: var(--buttons-overflow);
        transition: inline-size 200ms ease;
        will-change: inline-size;

        .button {
          opacity: var(--button-others-opacity);
          pointer-events: var(--button-others-pointer-events);
          transition: opacity 200ms ease;
          will-change: opacity;
        }

        .button--expand {
          position: absolute;
          inset-inline-start: 0;
          inset-block-start: 0;
          opacity: var(--button-expand-opacity);
          pointer-events: var(--button-expand-pointer-events);
        }
      }

      .live-controls__form {
        --submit-opacity: 1;
        --submit-pointer-events: auto;

        flex-grow: 1;
        min-inline-size: 0;
        block-size: var(--button-size-with-unit);
        border-radius: var(--button-size-with-unit);
        background-color: var(--live-controls-form-background-color);
        display: flex;

        &:has(input:placeholder-shown) {
          --submit-opacity: .5;
          --submit-pointer-events: none;
        }

        .live-controls__form__input {
          appearance: none;
          box-shadow: unset;
          border: unset;
          background: transparent;
          outline: 0 none;

          flex-grow: 1;
          min-inline-size: 0;
          font-size: var(--live-controls-input-font-size);
          color: var(--live-controls-input-text-color);
          padding-inline-start: 12px;
          text-overflow: ellipsis;
          box-sizing: border-box;

          &::placeholder {
            color: var(--live-controls-input-placeholder-color);
          }

          &:focus {
            font-size: max(16px, var(--live-controls-input-font-size));
          }

          &[list]::-webkit-calendar-picker-indicator {
            opacity: 0;
            pointer-events: none;
          }

          &[list]::-webkit-list-button {
            opacity: 0;
            pointer-events: none;
          }
        }

        .button--send {
          pointer-events: var(--submit-pointer-events);
          opacity: var(--submit-opacity);
          transition: opacity 200ms ease;
          will-change: opacity;
        }
      }

      .live-controls__like {
        flex-shrink: 0;
        position: relative;
        inline-size: fit-content;

        .button {
          z-index: 1;
        }

        .live-controls__like__emotions {
          position: absolute;
          inset-inline: 0;
          inset-block: 0;
          margin: auto;
          pointer-events: none;

          .emotion-unit {
            --rotate: 0deg;

            --emotion-sign: var(--emotion-sign-1);
            --emotion-animation-name: none;
            --emotion-sign-animation-name: none;

            position: absolute;
            inset-inline-start: 0;
            inset-block-start: 0;
            inline-size: 100%;
            block-size: 100%;
            transform-origin: 50% 50%;
            pointer-events: none;
            rotate: var(--rotate);

            &[data-active] {
              --emotion-animation-name: emotion-show-up;
              --emotion-sign-animation-name: emotion-horizontal-swing;
            }

            .emotion {
              inline-size: 100%;
              block-size: 100%;
              scale: 0;
              opacity: 0;
              animation: var(--emotion-animation-name) 1800ms linear forwards;

              .emotion__sign {
                inline-size: 100%;
                aspect-ratio: 1/1;
                display: block;
                background: no-repeat center/100% var(--emotion-sign);
                rotate: calc(var(--rotate) * -1);

                animation: var(--emotion-sign-animation-name) 800ms linear infinite;
              }
            }

            /* sign */
            &[data-sign="1"] { --emotion-sign: var(--emotion-sign-1); }
            &[data-sign="2"] { --emotion-sign: var(--emotion-sign-2); }
            &[data-sign="3"] { --emotion-sign: var(--emotion-sign-3); }
            &[data-sign="4"] { --emotion-sign: var(--emotion-sign-4); }
            &[data-sign="5"] { --emotion-sign: var(--emotion-sign-5); }
            &[data-sign="6"] { --emotion-sign: var(--emotion-sign-6); }
            &[data-sign="7"] { --emotion-sign: var(--emotion-sign-7); }
            &[data-sign="8"] { --emotion-sign: var(--emotion-sign-8); }
            &[data-sign="9"] { --emotion-sign: var(--emotion-sign-9); }

            /* angle */
            &[data-angle="1"] { --rotate: -15deg; }
            &[data-angle="2"] { --rotate: -14deg; }
            &[data-angle="3"] { --rotate: -13deg; }
            &[data-angle="4"] { --rotate: -12deg; }
            &[data-angle="5"] { --rotate: -11deg; }
            &[data-angle="6"] { --rotate: -10deg; }
            &[data-angle="7"] { --rotate: -9deg; }
            &[data-angle="8"] { --rotate: -8deg; }
            &[data-angle="9"] { --rotate: -7deg; }
            &[data-angle="10"] { --rotate: -6deg; }
            &[data-angle="11"] { --rotate: -5deg; }
            &[data-angle="12"] { --rotate: -4deg; }
            &[data-angle="13"] { --rotate: -3deg; }
            &[data-angle="14"] { --rotate: -2deg; }
            &[data-angle="15"] { --rotate: -1deg; }
            &[data-angle="16"] { --rotate: 0deg; }
            &[data-angle="17"] { --rotate: 1deg; }
            &[data-angle="18"] { --rotate: 2deg; }
            &[data-angle="19"] { --rotate: 3deg; }
            &[data-angle="20"] { --rotate: 4deg; }
            &[data-angle="21"] { --rotate: 5deg; }
            &[data-angle="22"] { --rotate: 6deg; }
            &[data-angle="23"] { --rotate: 7deg; }
            &[data-angle="24"] { --rotate: 8deg; }
            &[data-angle="25"] { --rotate: 9deg; }
            &[data-angle="26"] { --rotate: 10deg; }
            &[data-angle="27"] { --rotate: 11deg; }
            &[data-angle="28"] { --rotate: 12deg; }
            &[data-angle="29"] { --rotate: 13deg; }
            &[data-angle="30"] { --rotate: 14deg; }
            &[data-angle="31"] { --rotate: 15deg; }
          }
        }
      }
    }

    .reactions {
      position: absolute;
      inset: 0;
      pointer-events: none;

      .reaction {
        --reaction-icon-scale: calc((var(--reaction-size) * .65) / 24);
        --reaction-size-with-unit: calc(var(--reaction-size) * 1px);
        --icon: none;

        position: absolute;
        inset: 0;
        margin: auto;

        inline-size: var(--reaction-size-with-unit);
        aspect-ratio: 1/1;
        border-radius: var(--reaction-size-with-unit);
        background-color: rgba(0 0 0/.75);
        display: grid;
        place-content: center;
        opacity: 0;
        scale: 0;
        will-change: opacity, scale;

        &.reaction--static {
          opacity: 1;
          scale: 1;
        }

        &[data-active]:not(.reaction--static) {
          animation: reaction-in 550ms ease 100ms forwards;
        }
        
        &::before {
          content: '';
          inline-size: 24px;
          aspect-ratio: 1/1;
          display: block;
          background-color: rgba(255 255 255);
          clip-path: var(--icon);
          scale: var(--reaction-icon-scale);
        }

        &.reaction--play {
          --icon: var(--icon-play);
        }

        &.reaction--pause {
          --icon: var(--icon-pause);
        }

        &.reaction--mute {
          --icon: var(--icon-volume-off);
        }

        &.reaction--unmute {
          --icon: var(--icon-volume-up);
        }

        &.reaction--fullscreen {
          --icon: var(--icon-fullscreen);
        }

        &.reaction--unfullscreen {
          --icon: var(--icon-fullscreen-exit);
        }

        &.reaction--forward10 {
          --icon: var(--icon-forward10);
        }

        &.reaction--replay10 {
          --icon: var(--icon-replay10);
        }

        &.reaction--forward5 {
          --icon: var(--icon-forward5);
        }

        &.reaction--replay5 {
          --icon: var(--icon-replay5);
        }
      }
    }
  }

  /* button */
  .button {
    --before-icon: none;
    --before-scale: var(--button-icon-scale-basis);
    --after-icon: none;
    --after-scale: 0;

    flex-shrink: 0;
    font-size: 0;
    appearance: none;
    box-shadow: unset;
    border: unset;
    background: transparent;
    -webkit-user-select: none;
    user-select: none;
    pointer-events: auto;
    margin: 0;
    padding: 0;
    outline: 0 none;

    position: relative;
    inline-size: var(--button-size-with-unit);
    aspect-ratio: 1/1;

    &:active {
      scale: .8;
    }

    &:focus-visible {
      animation: leaping 200ms ease;
      border-radius: var(--button-size-with-unit);
      background-color: var(--button-focus-visible-color);
      box-shadow: 0 0 0 2px var(--button-focus-visible-color);
    }

    @media (hover: hover) {
      &:hover {
        animation: leaping 200ms ease;
      }
    }

    &::before,
    &::after {
      position: absolute;
      inset-inline-start: 50%;
      inset-block-start: 50%;
      content: '';
      inline-size: 24px;
      aspect-ratio: 1/1;
      display: block;
      background-color: var(--button-icon-color);
      clip-path: var(--icon-play);
      margin-inline-start: -12px;
      margin-block-start: -12px;
      scale: var(--button-icon-scale-basis);
      transition: scale 250ms ease;
      will-change: scale;
    }

    &::before {
      scale: var(--before-scale);
      clip-path: var(--before-icon);
    }

    &::after {
      scale: var(--after-scale);
      clip-path: var(--after-icon);
    }

    &[data-reverse] {
      --before-scale: 0;
      --after-scale: var(--button-icon-scale-basis);
    }
  }

  .button--play {
    --before-icon: var(--icon-play);
    --after-icon: var(--icon-pause);

    &[data-type=replay] {
      --before-icon: var(--icon-replay);
    }
  }

  .button--mute {
    --before-icon: var(--icon-volume-up);
    --after-icon: var(--icon-volume-off);
  }

  .button--fullscreen {
    --before-icon: var(--icon-fullscreen);
    --after-icon: var(--icon-fullscreen-exit);
  }

  .button--share {
    --before-icon: var(--icon-share);
    
    &::after {
      display: none;
    }
  }

  .button--pip {
    --before-icon: var(--icon-pip);
    
    &::after {
      display: none;
    }
  }

  .button--subtitles {
    --before-icon: var(--icon-subtitles);
    --after-icon: var(--icon-subtitles-off);
  }

  .button--expand {
    --before-icon: var(--icon-chevron-right);
    
    &::after {
      display: none;
    }
  }

  .button--like {
    --before-icon: var(--icon-thumb-up);
    
    &::after {
      display: none;
    }
  }

  .button--screenshot {
    --before-icon: var(--icon-camera);
    
    &::after {
      display: none;
    }
  }

  .button--send {
    --before-icon: var(--icon-send);
    
    &::after {
      display: none;
    }
  }

  @media (hover: hover) {
    --slider-thumb-scale: 0;
    --indicator-scale: .5;

    .progress-wrap:hover {
      --slider-thumb-scale: var(--slider-thumb-hover-scale);
      --indicator-scale: var(--indicator-hover-scale);
    }
  }
}

.main--inside-any-pip {
  --preview-inset-block-start-stuff: calc(40px + 8px);
}

@keyframes leaping {
  0% { scale: 1; }
  50% { scale: var(--leaping-scale, 1.3); }
  100% { scale: 1; }
}

@keyframes reaction-in {
  0% { opacity: 0; scale: 0; }
  10% { opacity: 1; scale: 1; }
  100% { opacity: 0; scale: 1.5; }
}

@keyframes emotion-horizontal-swing {
  0% { transform: translateX(0%); }
  25% { transform: translateX(-50%); }
  50% { transform: translateX(0%); }
  75% { transform: translateX(50%); }
  100% { transform: translateX(0%); }
}

@keyframes emotion-show-up {
  0% { scale:0; opacity:0; translate:0% 0%; }
  5% { scale:.5; opacity:.5; translate:0% 0%; }
  75% { scale:1; opacity:1; translate:0% calc(-100% * var(--emotion-float-ratio)); }
  100% { scale:1.4; opacity:0; translate:0% calc(-100% * (var(--emotion-float-ratio) * 1.5)); }
}

/* listings */
.listings {
  --broadcasting-text: var(--yahoo-x-bv-player-broadcasting-text, 'ON AIR');
  --sign-shipping-coupon-text: var(--yahoo-x-bv-player-listing-sign-shipping-coupon-text, '運費抵用券');
  --sign-coupon-text: var(--yahoo-x-bv-player-listing-sign-coupon-text, '折扣碼');
  --sign-buynow-text: var(--yahoo-x-bv-player-listing-sign-buynow-text, '直購');
  --sign-bid-text: var(--yahoo-x-bv-player-listing-sign-bid-text, '競標');
  --sold-start-text: var(--yahoo-x-bv-player-listing-sold-start-text, '售出');
  --sold-end-text: var(--yahoo-x-bv-player-listing-sold-end-text, '件');

  --gap: 1.5em;
  --border-radius: 1em;
  --buynow-button-pointer-events: auto;

  inline-size: 100%;
  padding-inline: .5em;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  counter-reset: order 0;

  .listings__unit {
    --background-color-normal: rgba(255 255 255/0);
    --background-color-active: var(--listing-hover-color);
    --background-color: var(--background-color-normal);

    --vision-size: 132px;
    --align-items: flex-start;
    --info-gap: 4px;
    --info-title-size: 1em;

    position: relative;
    inline-size: 100%;
    background-color: var(--background-color);
    border-radius: 1em;
    display: flex;
    gap: .75em;
    align-items: var(--align-items);
    box-shadow: 0 0 0 .5em var(--background-color);
    outline: 0 none;

    transition: background-color 200ms ease, box-shadow 200ms ease;
    will-change: background-color, box-shadow;

    @media screen and (width <= 767px) {
      --vision-size: 120px;
      --align-items: revert;
      --info-gap: 6px;
      --info-title-size: .875em;
    }

    &:focus-within {
      --background-color: var(--background-color-active);
    }

    @media (hover: hover) {
      &:hover {
        --background-color: var(--background-color-active);
      }
    }

    .buttons {
      --default-text-color: var(--listing-buynow-color);

      pointer-events: var(--buynow-button-pointer-events);

      @media screen and (width <= 767px) {
        --font-size: 12px;
        --block-size: 28px;
        --padding-inline: 20px;
        --gap: 4px;
      }
    }

    &:nth-of-type(n + 2)::before {
      --block-size: 1px;
      --inline-size: 96%;
      --inset-inline-start: calc((100% - var(--inline-size)) / 2);

      position: absolute;
      inset-inline-start: var(--inset-inline-start);
      inset-block-start: calc((var(--gap) / 2 - var(--block-size) / 2) * -1);
      content: '';
      inline-size: var(--inline-size);
      block-size: var(--block-size);
      background-color: var(--line-color);
    }

    &.listings__unit--current {
      --background-color-normal: var(--listing-broadcasting-color);
      --background-color-active: var(--listing-broadcasting-color);

      order: -1;

      &::before {
        inset-block: auto calc((var(--gap) / 2 + var(--block-size) / 2) * -1);
      }

      .listings__unit__vision::after {
        --block-size: 24px;

        position: absolute;
        inset-inline: 0;
        inset-block-end: 0;

        content: var(--broadcasting-text);
        color: rgba(255 255 255);
        font-size: .75em;
        line-height: var(--block-size);
        block-size: var(--block-size);
        background-color: rgba(0 0 0/.6);
        text-align: center;
      }
    }

    .listings__unit__vision {
      position: relative;
      flex-shrink: 0;
      inline-size: var(--vision-size);
      aspect-ratio: 1/1;
      border-radius: var(--border-radius);
      overflow: hidden;

      &::before {
        position: absolute;
        inset-inline-start: 0;
        inset-block-start: 0;
        color: rgba(255 255 255);
        background-color: rgba(0 0 0/.8);
        padding-inline: 10px;
        line-height: 1.5;
        content: '#' counter(order);
        font-size: 12px;
        z-index: 1;
        border-end-end-radius: 8px;

        counter-increment: order;
      }

      .listings__unit__vision__img {
        inline-size: 100%;
        block-size: 100%;
        display: block;
        object-fit: cover;
      }
    }

    .listings__unit__info {
      flex-grow: 1;
      min-inline-size: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      gap: var(--info-gap);

      .listings__unit__info__title {
        font-size: var(--info-title-size);
        color: var(--listing-title-color);
        hyphens: auto;
        word-break: break-all;
      }

      .listings__unit__info__prices {
        display: flex;
        gap: .5em;
        align-items: center;

        .listings__unit__info__prices__unit {
          font-size: 1.25em;
          color: var(--listing-price-color);
        }

        .listings__unit__info__prices__sign {
          color: var(--listing-price-color);
        }

        .listings__unit__info__prices__market-price {
          font-size: .75em;
          color: rgba(151 158 168);
          text-decoration: line-through;
        }

        .listings__unit__info__prices__discount {
          font-size: 0.75em;
          line-height: 16px;
          color: rgba(235 15 41);
          padding-inline: 4px;
          border-radius: 4px;
          background-color: color-mix(in srgb, rgba(235 15 41) 10%, white);
          white-space: nowrap;
          margin-inline-start: 4px;
        }
      }

      .listings__unit__info__marks {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .listings__unit__mark {
        --block-size: 18px;
        --border-size: 1px;
        --border-color: rgba(255 139 18);
        --background-color: rgba(255 139 18);
        --color: rgba(255 255 255);
        --text: var(--sign-shipping-coupon-text);

        font-size: .75em;
        color: var(--color);
        line-height: calc(var(--block-size) - var(--border-size) * 2);
        block-size: var(--block-size);
        background-color: var(--background-color);
        border: var(--border-size) solid var(--border-color);
        border-radius: 3px;
        padding-inline: 4px;
        box-sizing: border-box;

        &::before {
          content: var(--text);
        }

        &.listings__unit__mark--coupon,
        &.listings__unit__mark--bid {
          --background-color: transparent;
          --color: rgba(255 139 18);
        }

        &.listings__unit__mark--buynow {
          --background-color: transparent;
          --color: rgba(0 120 255);
          --border-color: var(--color);
        }

        &.listings__unit__mark--coupon {
          --text: var(--sign-coupon-text);
        }

        &.listings__unit__mark--buynow {
          --text: var(--sign-buynow-text);
        }

        &.listings__unit__mark--bid {
          --text: var(--sign-bid-text);
        }
      }

      .listings__unit__actions {
        display: flex;
        gap: .5em;
        align-items: center;
        justify-content: space-between;

        .listings__unit__actions__span {
          font-size: .75em;
          color: rgba(151 158 168);

          &:not(:empty) {
            &::before {
              content: var(--sold-start-text) ' ';
            }

            &::after {
              content: ' ' var(--sold-end-text);
            }
          }
        }

        .listings__unit__actions__buttons {
          flex-shrink: 0;
        }
      }
    }
  }
}

/* dialog */
.fuji-alerts {
  --background: var(--yahoo-x-bv-player-dialog-background-color, rgba(255 255 255));
  --backdrop-color: var(--yahoo-x-bv-player-dialog-backdrop-color, rgba(35 42 49/.6));
  --head-text-color: var(--yahoo-x-bv-player-dialog-head-text-color, rgba(35 42 49));
  --line-color: var(--yahoo-x-bv-player-dialog-line-color, rgba(199 205 210));
  --listing-title-color: var(--yahoo-x-bv-player-dialog-listing-title-color, rgba(35 42 49));
  --listing-price-color: var(--yahoo-x-bv-player-dialog-listing-price-color, rgba(235 15 41));
  --listing-hover-color: var(--yahoo-x-bv-player-dialog-listing-hover-color, rgba(240 243 245));
  --listing-broadcasting-color: var(--yahoo-x-bv-player-dialog-listing-broadcasting-color, rgba(255 211 51/.3));
  --listing-buynow-color: var(--yahoo-x-bv-player-dialog-listing-buynow-color, rgba(0 99 235));

  --close-icon-color: var(--yahoo-x-bv-player-dialog-close-icon-color, rgba(95 99 104));
  --close-hover-background-color: var(--yahoo-x-bv-player-dialog-close-hover-background-color, rgba(245 248 250));

  --padding-inline: 20px;
  --padding-block-start: 6px;
  --padding-block-end: var(--padding-inline);
  --margin: 24px;

  --content-inline-size: 600px;
  --content-max-inline-size: calc(100dvi - var(--padding-inline) * 2 - var(--margin) * 2);
  --content-max-block-size: calc(100dvb - var(--padding-block-start) - var(--padding-block-end) - var(--margin) * 2);

  --close-size: 40;
  --close-size-with-unit: calc(var(--close-size) * 1px);
  --close-mask: path('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z');
  --close-icon-scale: calc((var(--close-size) * .6) / 24);

  --main-max-block-size: calc(80dvb - var(--padding-block-start) - var(--padding-block-end) - (var(--close-size) * 1px + 4px + 1px)); /* fuji-alerts__form__head's padding-bottom + border size */

  background-color: var(--background);
  border-radius: 0.5em;
  border: 0 none;
  padding: var(--padding-block-start) var(--padding-inline) var(--padding-block-end);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.05);
  outline: 0 none;

  &::backdrop {
    background-color: var(--backdrop-color);
  }

  &[open],
  &[open]::backdrop {
    animation: fuji-alerts-open 400ms cubic-bezier(0.4, 0, 0.2, 1) normal;
  }

  &[close],
  &[close]::backdrop {
    animation: fuji-alerts-close 400ms cubic-bezier(0, 0, 0.2, 1) normal;
  }

  .fuji-alerts__form {
    --head-font-size: 1.125em;

    inline-size: var(--content-inline-size);
    block-size: fit-content;
    max-inline-size: var(--content-max-inline-size);
    max-block-size: var(--content-max-block-size);
    outline: 0 none;
    display: block;

    @media screen and (width <= 767px) {
      --head-font-size: 1em;
    }

    .fuji-alerts__form__head {
      block-size: var(--close-size);
      padding-block-end: 4px;
      border-block-end: 1px solid var(--line-color);

      display: flex;
      align-items: center;
      justify-content: space-between;

      .fuji-alerts__form__head__p {
        font-size: var(--head-font-size);
        color: var(--head-text-color);
      }
    }

    .fuji-alerts__form__main {
      --gap: 1em;
      --mask-vertical-size: var(--gap);
      --mask-vertical: linear-gradient(
        to bottom,
        transparent 0%,
        black calc(0% + var(--mask-vertical-size)),
        black calc(100% - var(--mask-vertical-size)),
        transparent 100%
      );

      /* scroll */
      --scrollbar-inline-size: 2px;
      --scrollbar-block-size: 2px;
      --scrollbar-background: transparent;
      --scrollbar-thumb-color: rgba(0 0 0/.2);
      --scrollbar-thumb: var(--scrollbar-thumb-color);

      inline-size: 100%;
      min-block-size: 100px;
      max-block-size: var(--main-max-block-size);
      overflow: hidden;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      box-sizing: border-box;
      mask-image: var(--mask-vertical);
      -webkit-mask-image: var(--mask-vertical);
      padding-block: var(--gap);

      &::-webkit-scrollbar {
        inline-size: var(--scrollbar-inline-size);
        block-size: var(--scrollbar-block-size);
      }

      &::-webkit-scrollbar-track {
        background: var(--scrollbar-background);
      }

      &::-webkit-scrollbar-thumb {
        border-radius: var(--scrollbar-block-size);
        background: var(--scrollbar-thumb);
      }
    }
  }

  .fuji-alerts__close {
    --background-color-normal: rgba(255 255 255/0);
    --background-color-active: var(--close-hover-background-color);
    --background-color: var(--background-color-normal);

    font-size: 0;
    position: relative;
    inline-size: var(--close-size-with-unit);
    aspect-ratio: 1/1;
    appearance: none;
    border: 0 none;
    border-radius: var(--close-size-with-unit);
    outline: 0 none;
    background-color: var(--background-color);
    transition: background-color 200ms ease;
    will-change: background-color;
    z-index: 1;

    &::before {
      position: absolute;
      inset-inline: 0 0;
      inset-block: 0 0;
      margin: auto;
      inline-size: 24px;
      block-size: 24px;
      content: '';
      background-color: var(--close-icon-color);
      clip-path: var(--close-mask);
      scale: var(--close-icon-scale);
    }

    &:active {
      scale: .8;
    }

    &:focus {
      --background-color: var(--background-color-active);
    }

    @media (hover: hover) {
      &:hover {
        --background-color: var(--background-color-active);
      }
    }
  }

  @media screen and (width <= 767px) {
    --padding-inline: 12px;
    --padding-block-start: 4px;
    --margin: 0px;

    --close-size: 32;
    --content-inline-size: 100dvi;

    border-end-start-radius: 0;
    border-end-end-radius: 0;

    &[open],
    &[close] {
      animation: revert;
    }

    &[open]:modal {
      animation: fuji-alerts-open-dock 400ms cubic-bezier(0.4, 0, 0.2, 1) normal;
    }

    &[close]:modal {
      animation: fuji-alerts-close-dock 400ms cubic-bezier(0, 0, 0.2, 1) normal;
    }

    &:modal {
      inline-size: 100%;
      max-inline-size: 100%;
      box-sizing: border-box;
      inset-block: auto 0;
    }
  }
}

@keyframes fuji-alerts-open {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fuji-alerts-close {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes fuji-alerts-open-dock {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0%);
    opacity: 1;
  }
}

@keyframes fuji-alerts-close-dock {
  from {
    transform: translateY(0%);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}
</style>

<div class="main" ontouchstart="" tabindex="0" data-type="live">
  <div class="video-container"></div>
  
  <div class="scenes">
    <img class="poster" />

    <div class="host">
      <a href="${defaults.host.link}" class="host__ens" target="_blank" rel="noreferrer noopener">
        <img class="host__ens__avatar" src="${defaults.host.avatar}" />
        <div class="host__ens__info">
          <p class="host__ens__info__name text-overflow">
            ${defaults.host.name}
          </p>
          <span class="host__ens__count">
            ${defaults.host.count}
          </span>
        </div>
        <button type="button" class="button button--follow">
          follow
        </button>
      </a>
    </div>

    <div class="chatroom">
      <div class="auto-scroll">
        <div class="chatroom__messages"></div>
      </div>
    </div>

    <div class="preview">
      <button type="button" class="preview__trigger" data-serial-no="1" data-action="open">
        <img class="preview__img" />
        <span class="preview__span">View</span>
      </button>
    </div>

    <div class="controls">
      <div class="progress-wrap">
        <input class="progress__input" type="range" step=".01" min="0" max="100" value="0" />
        <div class="progress__indicators">
          <progress class="progress__indicator progress__indicator--buffer" min="0" max="100" value="0"></progress>
          <progress class="progress__indicator progress__indicator--duration" min="0" max="100" value="0"></progress>
        </div>
      </div>
      <div class="actions">
        <div class="actions__part">
          <button type="button" class="button button--play" data-action="play">play</button>
          <button type="button" class="button button--mute" data-action="mute">mute</button>
          <span class="time-information">
            <em class="time-information__passed"></em>/<em class="time-information__ended"></em>
          </span>
        </div>
        <div class="actions__part actions__part--end">
          <button type="button" class="button button--screenshot" data-action="screenshot">screenshot</button>
          <button type="button" class="button button--share" data-action="share">share</button>
          <button type="button" class="button button--subtitles" data-action="refreshing">refreshing</button>
          <button type="button" class="button button--pip" data-action="pip">picture in picture</button>
          <button id="button-fullscreen" type="button" class="button button--fullscreen" data-action="fullscreen">fullscreen</button>
          <a href="${defaults.share.url}" class="yahoo-logo stuff" target="_blank" rel="noreferrer noopener">
            Yahoo 拍賣
          </a>
        </div>
      </div>
    </div>

    <div id="live-controls" class="live-controls">
      <div class="live-controls__buttons">
        <button type="button" class="button button--expand" data-action="expand">expand</button>

        <button type="button" class="button button--mute" data-action="mute">mute</button>
        <button type="button" class="button button--screenshot" data-action="screenshot">screenshot</button>
        <button type="button" class="button button--share" data-action="share">share</button>
        <button type="button" class="button button--subtitles" data-action="refreshing">refreshing</button>
        <button type="button" class="button button--pip" data-action="pip">picture in picture</button>
        <button id="button-fullscreen" type="button" class="button button--fullscreen" data-action="fullscreen">fullscreen</button>
      </div>
      <form class="live-controls__form">
        <input class="live-controls__form__input" type="text" name="message" placeholder="Aa" autocorrect="off" autocomplete="off" autocapitalize="off" enterkeyhint="send" />
        <button type="submit" class="button button--send">send</button>
      </form>
      <div class="live-controls__like">
        <button type="button" class="button button--like" data-action="emotion">emotion</button>
        <div class="live-controls__like__emotions"></div>
      </div>
    </div>

    <div class="cancel-refreshing">
      <button type="button" class="button button--cancel-refreshing" data-action="cancel-refreshing" data-reverse>cancel refreshing</button>
    </div>

    <div class="reactions"></div>
  </div>

  <datalist id="message-template"></datalist>
</div>

<dialog class="fuji-alerts">
  <form class="fuji-alerts__form dialog-content">
    <div class="fuji-alerts__form__head">
      <p class="fuji-alerts__form__head__p">Products</p>
      <button
        type="button"
        class="fuji-alerts__close"
        data-action="close"
      >
        cancel
      </button>
    </div>

    <div class="fuji-alerts__form__main">
      <div class="listings"></div>
    </div>
  </form>
</dialog>
`;

const templateReaction = document.createElement('template');
templateReaction.innerHTML = `
<em class="reaction reaction--{{action}} {{#isStatic}}reaction--static{{/isStatic}}"></em>
`;

const templateProducts = document.createElement('template');
templateProducts.innerHTML = `
{{#products}}
  <a href="{{link}}" class="listings__unit {{#broadcasting}}listings__unit--current{{/broadcasting}}" target="_blank" rel="noreferrer noopener">
    <div class="listings__unit__vision">
      <img class="listings__unit__vision__img" src="{{thumbnail}}" />
    </div>
    <div class="listings__unit__info">
      <p class="listings__unit__info__title line-clampin">{{title}}</p>
      <div class="listings__unit__info__prices">
        {{#priceRange}}
          <em class="listings__unit__info__prices__unit">{{priceRange.min}}</em>
          <span class="listings__unit__info__prices__sign">~</span>
          <em class="listings__unit__info__prices__unit">{{priceRange.max}}</em>
        {{/priceRange}}

        {{^priceRange}}
          {{#price}}
            <em class="listings__unit__info__prices__unit">{{price}}</em>
            {{#marketPrice}}
              <em class="listings__unit__info__prices__market-price">{{marketPrice}}</em>
            {{/marketPrice}}
          {{/price}}
        {{/priceRange}}

        {{#bestDiscount}}
          <em class="listings__unit__info__prices__discount">{{bestDiscount}}</em>
        {{/bestDiscount}}
      </div>
      <div class="listings__unit__info__marks">
        {{#marks.shippingCoupon}}
          <mark class="listings__unit__mark"></mark>
        {{/marks.shippingCoupon}}

        {{#marks.coupon}}
          <mark class="listings__unit__mark listings__unit__mark--coupon"></mark>
        {{/marks.coupon}}

        {{#marks.buynow}}
          <mark class="listings__unit__mark listings__unit__mark--buynow"></mark>
        {{/marks.buynow}}

        {{#marks.bid}}
          <mark class="listings__unit__mark listings__unit__mark--bid"></mark>
        {{/marks.bid}}
      </div>
      <div class="listings__unit__actions">
        <span class="listings__unit__actions__span">{{#buyCount}}{{buyCount}}{{/buyCount}}</span>
        <div class="listings__unit__actions__buttons">
          <button
            type="button"
            class="buttons"
            data-type="secondary1"
            data-size="small"
            data-merchandise-id="{{id}}"
            data-sn="{{sn}}"
          >
            {{buynowText}}
          </button>
        </div>
      </div>
    </div>
  </a>
{{/products}}
`;

const templateMessageTemplate = document.createElement('template');
templateMessageTemplate.innerHTML = `
{{#list}}
  <option value="{{.}}">{{.}}</option>
{{/list}}
`;

const templateMessage = document.createElement('template');
templateMessage.innerHTML = `
<p id={{id}} class="chatroom__messages__unit {{#rushbuying}}chatroom__messages__unit--rushbuying{{/rushbuying}} {{#announce}}chatroom__messages__unit--announce{{/announce}}" data-admin="{{admin}}">
  {{#host}}<span class="chatroom__messages__unit__host">{{host}}</span>{{/host}}{{message}}
</p>
`;

const templateEmotion = document.createElement('template');
templateEmotion.innerHTML = `
<div id="{{id}}" class="emotion-unit" data-sign="{{sign}}" data-angle="{{angle}}">
  <div class="emotion">
    <em class="emotion__sign"></em>
  </div>
</div>
`;

// Houdini Props and Vals, https://web.dev/at-property/
if (CSS?.registerProperty) {
  try {
    CSS.registerProperty({
      name: '--yahoo-x-bv-player-padding-inline-basis',
      syntax: '<length>',
      inherits: true,
      initialValue: '12px'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-padding-block-end-basis',
      syntax: '<length>',
      inherits: true,
      initialValue: '8px'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-slider-thumb-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(234 51 35)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-slider-thumb-shadow-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(0 0 0)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-indicator-background',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255/.2)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-indicator-buffer-start',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255/.4)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-indicator-buffer-end',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255/.4)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-indicator-duration-start',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(234 51 35)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-indicator-duration-end',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(234 51 35)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-time-info-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-button-icon-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-button-focus-visible-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(0 0 0/.5)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-dialog-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-dialog-backdrop-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(35 42 49/.6)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-dialog-head-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(35 42 49)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-dialog-listing-title-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(35 42 49)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-dialog-line-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(199 205 210)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-dialog-listing-price-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(235 15 41)'
    });
    
    CSS.registerProperty({
      name: '--yahoo-x-bv-player-dialog-listing-hover-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(240 243 245)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-dialog-listing-broadcasting-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 211 51/.3)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-dialog-close-hover-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(245 248 250)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-dialog-close-icon-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(95 99 104)'
    });
    
    CSS.registerProperty({
      name: '--yahoo-x-bv-player-dialog-listing-buynow-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(0 99 235)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-live-controls-input-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-live-controls-input-placeholder-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255/.5)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-live-controls-form-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(0 0 0/.75)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-chatroom-message-owner-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-chatroom-message-owner-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 82 13)'
    });

    CSS.registerProperty({
      name: '--yahoo-x-bv-player-poster-background-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(0 0 0)'
    });
  } catch(err) {
    console.warn(`yahoo-x-bv-player: ${err.message}`);
  }
}

// to avoid too many chatroom connect / disconnect, make one instance one connect only
const chatrooms = {};
const getChatroomId = (target) => {
  let id = '';

  if (target.dataset.chatroomid) {
    id = target.dataset.chatroomid;
  } else {
    id = _wcl.getUUID();
    target.dataset.chatroomid = id;
  }

  return id;
};

const findLastMessageType = (messages = {}, type = 'carousel') => {
  let data = {};

  if (Object.keys(messages).length) {
    const keys = Object.keys(messages).sort((a, b) => +a - +b);
    const found = keys.findLastIndex(
      (key) => {
        const idx = messages[key].findIndex(
          ({ raw = '' } = {}) => {
            return raw.includes(type);
          }
        );
        return idx !== -1;
      }
    );

    if (found !== -1) {
      const key = keys[found];
      const idx = messages[key].findLastIndex(
        ({ raw = '' } = {}) => {
          return raw.includes(type);
        }
      );

      try {
        data = JSON.parse(messages[key][idx]['raw']);
      } catch(err) {
        console.warn(`yahoo-x-bv-player: ${err.message}`);
      }
    }
  }

  return data;
};

const setupChatroom = async (target, config, callbacks) => {
  const { token = '', refreshToken = '', host = '' } = config;

  if (!token || !refreshToken || !host) {
    return {};
  }

  const id = getChatroomId(target);

  // gather chatroom information
  if (!chatrooms[id]) {
    try {
      const { Chatroom } = window.BlendVisionChatroomSDK;
      const data = await Chatroom.init({ chatToken: token, refreshToken, host });
      const {
        chatroom: {
          customCounters = [],
          createdAt = ''
        } = {}
      } = data || {};

      Chatroom.register(callbacks);

      // like count
      const findIndex = customCounters.findIndex(({ key = '' } = {}) => key === 'like');
      const likeCount = findIndex != -1 ? customCounters[findIndex]?.value : 0;

      // messages
      const limit = 100;
      let messages = [];
      let tmp = [];
      do {
        const afterAt = messages?.at(-1)?.receivedAt;

        tmp = await Chatroom.getChatMessages({
          fromOldest: true,
          limit,
          ...(afterAt && { afterAt })
        });

        messages = messages.concat(tmp);
      } while (tmp.length !== 0);

      const startAt = new Date(createdAt);
      messages = messages.reduce(
        (acc, message = {}) => {
          const {
            key = '',
            value = '',
            text = '',
            receivedAt = '',
            user = {}
          } = message;

          if (key === 'like' || !receivedAt) {
            return acc;
          }

          const timeframe = Math.floor((new Date(receivedAt) - startAt) / 1000);
          if (!acc[timeframe]) {
            acc[timeframe] = [];
          }

          acc[timeframe].push({
            user,
            raw: text || value,
          });

          return acc;
        }
      , {});

      // dummy message
      /*
      const user = {
        customName: 'Yahoo拍賣',
        deviceId: 'd1ec8c3d-d83a-40dd-88de-f047b5fb0cd7',
        id: 'K37KBMJA6XYDOG6HQAAGK4LXXA',
        isAdmin: false
      };
      messages = {
        '1': [
          { user, raw: '{"type":"enterRoom","content":"加入圍觀群眾"}' },
          { user, raw: '{"type":"grabListing","content":"正在瘋搶商品！"}' },
          { user, raw: '{"type":"hostMessage","content":"來自直播主的訊息"}' }, 
          { user, raw: '{"type":"userMessage","content":"來自粉絲的訊息"}' }
        ],
        '3': [
          { user, raw: '{"type":"hostMessage","content":"來自直播主的訊息1"}' },
          { user, raw: '{"type":"carousel","content":{"text":"來自小美的大聲公訊息 testing"}}' },
          { user, raw: '{"type":"hostMessage","content":"來自直播主的訊息2"}' },
          { user, raw: '{"type":"grabListing","content":"正在瘋搶商品！"}' },
          { user, raw: '{"type":"carousel","content":{"text":"來自小美的大聲公訊息 來自小美的大聲公訊息"}}' }
        ],
        '7': [
          { user, raw: '{"type":"shareLive","content":"分享了直播！"}' },
          { user, raw: '{"type":"userMessage","content":"來自粉絲的訊息"}' }, 
          { user, raw: '{"type":"trophy","content":"送出了 1000 個讚。"}' },
          { user, raw: '{"type":"sellingListing","content":{"id":"334c6ea9-244e-4a6c-b320-d3506b4d6d92"}}' }
        ],
        '5': [
          { user, raw: '{"type":"favoriteHost","content":"把主播加入最愛！"}' },
          { user, raw: '{"type":"userMessage","content":"來自粉絲的訊息"}' }, 
          { user, raw: '{"type":"screenshot","content":"拍了張紀念照。"}' }
        ]
      };
      */

      // get lastest announce
      const {
        content: {
          text: announce = ''
        } = {}
      } = findLastMessageType(messages, 'carousel');

      // get lastest broadcasting listing uuid
      const {
        content: {
          id: listingUuid = ''
        } = {}
      } = findLastMessageType(messages, 'sellingListing');

      chatrooms[id] = {
        chatroomData: data,
        chatroom: Chatroom,
        messages,
        likeCount,
        announce: announce.trim(),
        listingUuid
      };

      // console.log(`BV Chatroom init success.`, data);
    } catch (err) {
      console.warn('BV Chatroom init fail.');
    }
  }

  return chatrooms[id] || {};
};

const updateChatroomLikeCount = (target, count) => {
  const id = getChatroomId(target);

  if (chatrooms[id]) {
    chatrooms[id].likeCount = count;
  }
};

const updateChatroomBlockUser = (target, blockedUsers = []) => {
  const id = getChatroomId(target);
  
  if (chatrooms[id]) {
    chatrooms[id].chatroomData.chatroom.blockedUsers = [...blockedUsers];
  }
};

export class YahooXBvPlayer extends HTMLElement {
  #data;
  #nodes;
  #config;

  constructor(config) {
    super();

    // template
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // data
    this.#data = {
      controller: '',
      controllerForVideo: '',
      controllerForSocket: '',
      tid: '',
      tidForDigestEmotions: '',
      trophyMilestones,
      userLikeCount: 0,
      likeCount: 0,
      reserveLikeCount: 0,
      viewCount: 0,
      recallKey: '',
      socket: ''
    };

    // nodes
    this.#nodes = {
      styleSheet: this.shadowRoot.querySelector('style'),
      main: this.shadowRoot.querySelector('.main'),
      container: this.shadowRoot.querySelector('.video-container'),
      btnPlay: this.shadowRoot.querySelector('.button--play'),
      btnScreenshots: Array.from(this.shadowRoot.querySelectorAll('.button--screenshot')),
      btnShares: Array.from(this.shadowRoot.querySelectorAll('.button--share')),
      btnMutes: Array.from(this.shadowRoot.querySelectorAll('.button--mute')),
      btnFullscreens: Array.from(this.shadowRoot.querySelectorAll('.button--fullscreen')),
      btnPips: Array.from(this.shadowRoot.querySelectorAll('.button--pip')),
      btnCancelRefreshing: this.shadowRoot.querySelector('.button--cancel-refreshing'),
      btnPreview: this.shadowRoot.querySelector('.preview__trigger'),
      btnLike: this.shadowRoot.querySelector('.button--like'),
      btnDialogClose: this.shadowRoot.querySelector('.fuji-alerts__close'),
      btnFollow: this.shadowRoot.querySelector('.button--follow'),
      progress: this.shadowRoot.querySelector('.progress__input'),
      progressBuffer: this.shadowRoot.querySelector('.progress__indicator--buffer'),
      progressDuration: this.shadowRoot.querySelector('.progress__indicator--duration'),
      timePassed: this.shadowRoot.querySelector('.time-information__passed'),
      timeEnded: this.shadowRoot.querySelector('.time-information__ended'),
      reactions: this.shadowRoot.querySelector('.reactions'),
      logo: this.shadowRoot.querySelector('.yahoo-logo'),
      poster: this.shadowRoot.querySelector('.poster'),
      host: this.shadowRoot.querySelector('.host__ens'),
      viewCount: this.shadowRoot.querySelector('.host__ens__count'),
      dialog: this.shadowRoot.querySelector('dialog'),
      listings: this.shadowRoot.querySelector('.fuji-alerts .listings'),
      listingsHead: this.shadowRoot.querySelector('.fuji-alerts__form__head__p'),
      chatroom: this.shadowRoot.querySelector('.chatroom'),
      messages: this.shadowRoot.querySelector('.chatroom__messages'),
      messageForm: this.shadowRoot.querySelector('.live-controls__form'),
      messageInput: this.shadowRoot.querySelector('.live-controls__form__input'),
      messageTemplate: this.shadowRoot.querySelector('#message-template'),
      liveActions: this.shadowRoot.querySelector('.live-controls__buttons'),
      emotions: this.shadowRoot.querySelector('.live-controls__like__emotions'),
      previewTrigger: this.shadowRoot.querySelector('.preview__trigger'),
      previewImg: this.shadowRoot.querySelector('.preview__img'),
      previewSpan: this.shadowRoot.querySelector('.preview__span')
    };

    // config
    this.#config = {
      ...defaults,
      ...config // new YahooXBvPlayer(config)
    };

    // evts
    this._playerEventsHandler = this._playerEventsHandler.bind(this);
    this._onControlsButtonClick = this._onControlsButtonClick.bind(this);
    this._onFullscreenchange = this._onFullscreenchange.bind(this);
    this._onDblclick = this._onDblclick.bind(this);
    this._onStageClick = this._onStageClick.bind(this);
    this._onProgressInput = this._onProgressInput.bind(this);
    this._onReactionAnimationend = this._onReactionAnimationend.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onEnterpictureinpicture = this._onEnterpictureinpicture.bind(this);
    this._onContextmenu = this._onContextmenu.bind(this);
    this._onMouseEventsHandler = this._onMouseEventsHandler.bind(this);
    this._onCancelRefreshing = this._onCancelRefreshing.bind(this);
    this._onDialogCancel = this._onDialogCancel.bind(this);
    this._onDialogButtonsClick = this._onDialogButtonsClick.bind(this);
    this._onListingsClick = this._onListingsClick.bind(this);
    this._onMessageSubmit = this._onMessageSubmit.bind(this);
    this._onEmotionAnimationend = this._onEmotionAnimationend.bind(this);
    this._onButtonFollowClick = this._onButtonFollowClick.bind(this);
    this._socketEventsHandler = this._socketEventsHandler.bind(this);
  }

  async connectedCallback() {
    const { config, error } = await _wcl.getWCConfig(this);
    const {
      main,
      btnShares,
      btnPips,
      btnCancelRefreshing,
      btnPreview,
      btnDialogClose,
      btnFollow,
      progress,
      reactions,
      dialog,
      listings,
      chatroom,
      messageForm,
      liveActions,
      emotions,
      btnLike
    } = this.#nodes;

    if (error) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${error}`);
      this.remove();
      return;
    } else {
      this.#config = {
        ...this.#config,
        ...config
      };
    }

    // picture in picture
    const anyPipEnable = !!window.documentPictureInPicture && this.parentNode.tagName.toLocaleLowerCase() === 'msc-any-pip';
    this.#data.anyPipEnable = anyPipEnable;

    // upgradeProperty
    const properties = Object.keys(defaults);
    const find = properties.splice(properties.findIndex((key) => key === 'l10n'), 1);
    properties.push(find[0]); // put l10n in end position
    properties.forEach((key) => this.#upgradeProperty(key));

    if (anyPipEnable || !pipEnabled) {
      if (anyPipEnable) {
        main.classList.add('main--inside-any-pip');
      }

      btnPips.forEach((button) => button.remove());
    }

    // share
    if (!navigator?.share) {
      btnShares.forEach((button) => button.remove());
    }

    // evts
    this.#data.controller = new AbortController();
    const signal = this.#data.controller.signal;
    const actions = main.querySelector('.controls .actions');

    main.addEventListener('keydown', this._onKeydown , { signal, capture: true });
    chatroom.addEventListener('click', this._onStageClick , { signal });
    chatroom.addEventListener('dblclick', this._onDblclick , { signal });
    progress.addEventListener('input', this._onProgressInput , { signal });
    actions.addEventListener('click', this._onControlsButtonClick, { signal });
    liveActions.addEventListener('click', this._onControlsButtonClick, { signal });
    reactions.addEventListener('animationend', this._onReactionAnimationend, { signal });
    btnCancelRefreshing.addEventListener('click', this._onCancelRefreshing, { signal });
    dialog.addEventListener('cancel', this._onDialogCancel, { signal });
    btnPreview.addEventListener('click', this._onDialogButtonsClick, { signal });
    btnDialogClose.addEventListener('click', this._onDialogButtonsClick, { signal });
    btnFollow.addEventListener('click', this._onButtonFollowClick, { signal });
    listings.addEventListener('click', this._onListingsClick, { signal });
    messageForm.addEventListener('submit', this._onMessageSubmit, { signal });
    emotions.addEventListener('animationend', this._onEmotionAnimationend, { signal });
    btnLike.addEventListener('click', this._onControlsButtonClick, { signal });

    // fullscreen
    if (fullscreenEnabled) {
      main.addEventListener('fullscreenchange', this._onFullscreenchange , { signal });
    }

    // mouseEvents
    // ['mousemove', 'mouseleave'].forEach((event) => main.addEventListener(event, this._onMouseEventsHandler));
  }

  disconnectedCallback() {
    const { dialog } = this.#nodes;

    if (dialog.open) {
      dialog.close();
    }

    updateChatroomLikeCount(this, this.#data.likeCount);

    if (this.#data.tid) {
      clearTimeout(this.#data.tid);
    }

    if (this.#data.tidForDigestEmotions) {
      clearTimeout(this.#data.tidForDigestEmotions);
    }

    if (this.#data.controller) {
      this.#data.controller.abort();
    }

    if (this.#data.controllerForVideo) {
      this.#data.controllerForVideo.abort();
    }

    if (this.#data.controllerForSocket) {
      this.#data.controllerForSocket.abort();
    }

    if (this.#data.socket?.close) {
      this.#data.socket.close();
    }

    if (this.#data.player) {
      this.#data.player.release();
    }
  }

  #format(attrName, oldValue, newValue) {
    const hasValue = newValue !== null;

    if (!hasValue) {
      if (booleanAttrs.includes(attrName)) {
        this.#config[attrName] = false;
      } else {
        this.#config[attrName] = defaults[attrName];
      }
    } else {
      switch (attrName) {
        case 'l10n':
        case 'host':
        case 'share':
        case 'products':
        case 'messagetemplate':
        case 'chatroomconfig':
        case 'ysocket':
        case 'playerconfig': {
          let values;
          try {
            values = JSON.parse(newValue);
          } catch(err) {
            console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
            values = Array.isArray(defaults[attrName]) ? [ ...defaults[attrName] ] : { ...defaults[attrName] };
          }

          if (attrName === 'l10n') {
            values = { ...defaults.l10n, ...values };
          }

          // force disable normalizeTabSwitch (BV vidibility event)
          if (attrName === 'playerconfig') {
            values.modulesConfig = {
              ...values.modulesConfig,
              normalizeTabSwitch: false
            };
          }

          this.#config[attrName] = values;
          break;
        }

        case 'type':
          this.#config[attrName] = legalTypes.includes(newValue) ? newValue : defaults.type;
          break;

        case 'poster':
          this.#config[attrName] = newValue;
          break;

        case 'loop':
        case 'autopilot':
          this.#config[attrName] = true;
          break;
      }
    }
  }

  async attributeChangedCallback(attrName, oldValue, newValue) {
    if (!YahooXBvPlayer.observedAttributes.includes(attrName)) {
      return;
    }

    this.#format(attrName, oldValue, newValue);

    switch (attrName) {
      case 'ysocket': {
        this.#setupSocket();
        break;
      }

      case 'chatroomconfig': {
        await this.#setupChatroom();
        break;
      }

      case 'playerconfig': {
        this.#setupPlayer();
        break;
      }

      case 'l10n': {
        const { buynow, previewtrigger, listingshead } = this.l10n;
        const { listings, previewSpan, listingsHead } = this.#nodes;
        const buttons = Array.from(listings.querySelectorAll('.listings__unit__actions__buttons .buttons'));

        // preview listing view
        previewSpan.textContent = previewtrigger;

        // dialog listings head
        listingsHead.textContent = listingshead;

        // listing button
        buttons.forEach((button) => button.textContent = buynow);
        break;
      }

      case 'messagetemplate': {
        const { messageInput, messageTemplate } = this.#nodes;

        if (this.messagetemplate.length) {
          messageTemplate.replaceChildren();
          const messageTemplateString = Mustache.render(templateMessageTemplate.innerHTML, { list: this.messagetemplate });
          messageTemplate.insertAdjacentHTML('beforeend', messageTemplateString);

          messageInput.setAttribute('list', messageTemplate.id);
        } else {
          messageInput.removeAttribute('list');
        }
        break;
      }

      case 'products': {
        /* mustache stuff */
        const { listings, previewTrigger, previewImg } = this.#nodes;
        const { buynow } = this.l10n;
        const products = this.products.map(
          (unit, idx) => {
            return {
              ...unit,
              sn: idx,
              buynowText: buynow
            };
          }
        );

        listings.replaceChildren();
        const productsString = Mustache.render(templateProducts.innerHTML, { products });
        listings.insertAdjacentHTML('beforeend', productsString);

        // broadcastingId
        let broadcastingId = products.findIndex(({ broadcasting = false }) => broadcasting);
        if (broadcastingId === -1) {
          broadcastingId = 0;
        }

        previewTrigger.dataset.serialNo = broadcastingId + 1;
        previewImg.src = products[broadcastingId].thumbnail;
        break;
      }

      case 'host': {
        const { host, viewCount } = this.#nodes;
        const { avatar, link, name, count = 0, follow = false } = this.host;

        host.href = link;
        host.querySelector('.host__ens__avatar').src = avatar;
        host.querySelector('.host__ens__info__name').textContent = name;
        host.querySelector('.button--follow').toggleAttribute('data-reverse', follow);
        viewCount.textContent = count;
        break;
      }

      case 'share':
        this.#nodes.logo.href = this.share.url;
        break;

      case 'poster':
        this.#nodes.poster.src = this.poster;

        if (this.#nodes.video) {
          this.#nodes.video.poster = this.poster;
        }
        break;

      case 'type':
        this.#nodes.main.dataset.type = this.type;
        break;

      case 'loop':
        if (this.#nodes.video) {
          this.#nodes.video[attrName] = this[attrName];
        }
        break;

      case 'autopilot':
        if (this.autopilot)  {
          this.#digestEmotions();
        }
        break;
    }
  }

  static get observedAttributes() {
    return Object.keys(defaults); // YahooXBvPlayer.observedAttributes
  }

  static get supportKeyboardKeys() {
    return legalKey;
  }

  static get supportedEvents() {
    return Object.keys(custumEvents).map(
      (key) => {
        return custumEvents[key];
      }
    );
  }

  #upgradeProperty(prop) {
    let value;

    if (YahooXBvPlayer.observedAttributes.includes(prop)) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        value = this[prop];
        delete this[prop];
      } else {
        if (booleanAttrs.includes(prop)) {
          value = (this.hasAttribute(prop) || this.#config[prop]) ? true : false;
        } else if (objectAttrs.includes(prop)) {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : JSON.stringify(this.#config[prop]);
        } else {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : this.#config[prop];
        }
      }

      this[prop] = value;
    }
  }

  set l10n(value) {
    if (value) {
      const newValue = {
        ...defaults.l10n,
        ...this.l10n,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('l10n', JSON.stringify(newValue));
    } else {
      this.removeAttribute('l10n');
    }
  }

  get l10n() {
    return this.#config.l10n;
  }

  set ysocket(value) {
    if (value) {
      const newValue = {
        ...defaults.ysocket,
        ...this.ysocket,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('ysocket', JSON.stringify(newValue));
    } else {
      this.removeAttribute('ysocket');
    }
  }

  get ysocket() {
    return this.#config.ysocket;
  }

  set chatroomconfig(value) {
    if (value) {
      const newValue = {
        ...defaults.chatroomconfig,
        ...this.chatroomconfig,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('chatroomconfig', JSON.stringify(newValue));
    } else {
      this.removeAttribute('chatroomconfig');
    }
  }

  get chatroomconfig() {
    return this.#config.chatroomconfig;
  }

  set playerconfig(value) {
    if (value) {
      const newValue = {
        ...defaults.playerconfig,
        ...this.playerconfig,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('playerconfig', JSON.stringify(newValue));
    } else {
      this.removeAttribute('playerconfig');
    }
  }

  get playerconfig() {
    return this.#config.playerconfig;
  }

  set messagetemplate(value) {
    if (value) {
      const newValue = [
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      ];
      this.setAttribute('messagetemplate', JSON.stringify(newValue));
    } else {
      this.removeAttribute('messagetemplate');
    }
  }

  get messagetemplate() {
    return this.#config.messagetemplate;
  }

  set products(value) {
    if (value) {
      const newValue = [
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      ];
      this.setAttribute('products', JSON.stringify(newValue));
    } else {
      this.removeAttribute('products');
    }
  }

  get products() {
    return this.#config.products;
  }

  set host(value) {
    if (value) {
      const newValue = {
        ...defaults.host,
        ...this.host,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('host', JSON.stringify(newValue));
    } else {
      this.removeAttribute('host');
    }
  }

  get host() {
    return this.#config.host;
  }

  set share(value) {
    if (value) {
      const newValue = {
        ...defaults.share,
        ...this.share,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('share', JSON.stringify(newValue));
    } else {
      this.removeAttribute('share');
    }
  }

  get share() {
    return this.#config.share;
  }

  set poster(value) {
    if (value) {
      this.setAttribute('poster', value);
    } else {
      this.removeAttribute('poster');
    }
  }

  get poster() {
    return this.#config.poster;
  }

  set type(value) {
    if (value) {
      this.setAttribute('type', value);
    } else {
      this.removeAttribute('type');
    }
  }

  get type() {
    return this.#config.type;
  }

  get duration() {
    return this.#data.player.getDuration();
  }

  set currentTime(value) {
    const time = +value;

    if (isNaN(time) || time < 0) {
      return;
    }

    this.#data.player.seek(time > this.duration ? this.duration : time);
  }

  get currentTime() {
    return this.#data.player.currentTime();
  }

  get paused() {
    return this.#nodes.video?.paused;
  }

  set loop(value) {
    this.toggleAttribute('loop', Boolean(value));
  }

  get loop() {
    return this.#config.loop;
  }

  set autopilot(value) {
    this.toggleAttribute('autopilot', Boolean(value));
  }

  get autopilot() {
    return this.#config.autopilot;
  }

  set muted(value) {
    this.#data.player[value ? 'mute' : 'unmute']();
  }

  get muted() {
    return this.#data.player.getVolume() === 0;
  }

  #fireEvent(evtName, detail) {
    this.dispatchEvent(new CustomEvent(evtName,
      {
        bubbles: true,
        composed: true,
        ...(detail && { detail })
      }
    ));
  }

  #timeFormat(seconds) {
    const time = [];
    let ct = Math.floor(seconds);
    let tmp = 0;

    //hour
    if (ct >= 3600) {
      tmp = Math.floor(ct / 3600);
      time.push(tmp);
      ct = ct % 3600;
    }

    //minute
    if (ct >= 60) {
      tmp = Math.floor(ct / 60);
      time.push(tmp);
      ct = ct % 60;
    } else {
      time.push('0');
    }

    //second
    if (ct) {
      if (ct < 10) {
        ct = '0' + ct;
      }
      time.push(ct);
    } else {
      time.push('00');
    }

    return time.join(':');
  }

  #setupSocket() {
    const { id = '', url = '' } = this.ysocket;

    if (!id && !url) {
      return;
    }

    // cancel exist socket
    if (this.#data.socket?.close) {
      this.#data.socket.close();
    }

    if (this.#data.controllerForSocket) {
      this.#data.controllerForSocket.abort();
    }

    // events
    this.#data.controllerForSocket = new AbortController();
    const signal = this.#data.controllerForSocket.signal;
    const events = ['open', 'message', 'error'];

    const socket = new window.WebSocket(url);
    events.forEach((event) => socket.addEventListener(event, this._socketEventsHandler, { signal }));
    this.#data.socket = socket;
  }

  async #setupChatroom() {
    const { token = '', refreshToken = '', host = '' } = this.chatroomconfig;
    
    if (!token || !refreshToken || !host) {
      return;
    }

    const { chatroomData = '', chatroom = '', messages = {}, likeCount = 0, announce = '', listingUuid = '' } = await setupChatroom(
      this,
      this.chatroomconfig,
      {
        onError: (err) => {
          console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
        },
        onTextReceived: ({ text:raw = '', user } = {}) => {
          if (raw) {
            this.#chatroomMessagesHandler({ user, raw });
          }
        },
        onCustomReceived: ({ value:raw = '', user } = {}) => {
          if (raw) {
            this.#chatroomMessagesHandler({ user, raw });
          }
        },
        onCustomCounterReceived: ({ user = {}, key }) => {
          const { id = '' } = user;
          const {
            user: {
              id: userId = ''
            } = {}
          } = this.#data.chatroomData;

          if (key !== 'like' || id === userId) {
            return;
          }

          this.#data.likeCount++;
          updateChatroomLikeCount(this, this.#data.likeCount);
          this.#data.reserveLikeCount++;
          this.#digestEmotions();
        },
        onCustomCounterUpdateReceived: ({ user = {}, customCounter = {} } = {}) => {
          const { customName = '' } = user;
          const { key = '', value = 0 } = customCounter;

          // take System only
          if (customName === 'System') {
            // like
            if (key === 'like') {
              const currentLikeCount = this.#data.likeCount;

              if (currentLikeCount < value) {
                updateChatroomLikeCount(this, value);

                this.#data.reserveLikeCount += value - currentLikeCount;
                this.#data.likeCount = value;
                this.#digestEmotions();
              }
            }
          }
        },
        onViewerInfoReceived: () => {
          // console.log('onViewerInfoReceived', packet);
        },
        onBlockUserReceived: ({ blockUnblockMessage = {} } = {}) => {
          const {
            user: {
              id = ''
            }
          } = blockUnblockMessage;
          const {
            user: {
              id: userId
            },
            chatroom: {
              blockedUsers = []
            }
          } = this.#data.chatroomData;

          const exist = blockedUsers.findIndex(({ id: blockUserId }) => id === blockUserId);
          if (exist === -1) {
            blockedUsers.push({ ...blockUnblockMessage.user });
          }
          
          // set form[inert]
          const found = blockedUsers.findIndex(({ id }) => id === userId);
          this.#nodes.messageForm.inert = found !== -1;

          // update storage
          this.#data.chatroomData.chatroom.blockedUsers = [...blockedUsers];
          updateChatroomBlockUser(this, blockedUsers);
        },
        onUnblockUserReceived: ({ blockUnblockMessage = {} } = {}) => {
          const {
            user: {
              id = ''
            }
          } = blockUnblockMessage;
          const {
            user: {
              id: userId
            },
            chatroom: {
              blockedUsers = []
            }
          } = this.#data.chatroomData;

          const blockedUsersN = blockedUsers.filter(({ id: blockUserId }) => blockUserId !== id);

          // set form[inert]
          const found = blockedUsersN.findIndex(({ id }) => id === userId);
          this.#nodes.messageForm.inert = found !== -1;

          // update storage
          this.#data.chatroomData.chatroom.blockedUsers = [...blockedUsersN];
          updateChatroomBlockUser(this, blockedUsersN);
        },
        onBroadcastReceived: ({ viewerMetrics = {} } = {}) => {
          const {
            total: {
              count = 0
            } = {}
          } = viewerMetrics;

          this.host = {
            ...this.host,
            count
          };

          // update only when type: live
          /*
          if (this.#isLIVE()) {
            this.#nodes.viewCount.textContent = count;
          }
          */
        }
      }
    );

    this.#data.chatroomData = chatroomData;
    this.#data.chatroom = chatroom;
    this.#data.historyMessages = messages;
    this.#data.likeCount = likeCount;

    // show announce
    if (!this.dataset.announce) {
      let content = announce || this.host?.announce;

      content = content?.trim();
      this.dataset.announce = 'y';

      if (content) {
        this.#renderMessage({ message: content, announce: true });
      }
    }

    // switch broadcasting listing
    if (!this.dataset.broadcastingset) {
      this.dataset.broadcastingset = 'y';

      if (listingUuid) {
        this.#chatroomMessagesHandler({ raw:`{"type":"sellingListing","content":{"id":"${listingUuid}"}}` });
      }
    }

    // show join message & recall latest messages
    if (this.#isLIVE() && !this.dataset.enterroom) {
      this.dataset.enterroom = 'y';
      this.#sendTextMessage('enterRoom', this.l10n.jointhecrowd);

      // recall messages
      const count = 10;
      const keys = Object.keys(messages)
        .sort((a, b) => +a - +b)
        .slice(count * -1);

      keys.forEach(
        (key) => {
          messages[key].forEach(
            (data) => {
              this.#chatroomMessagesHandler(data);
            }
          );
        }
      );
    }

    // form[inert] when user in blockUsers
    const {
      user: {
        id: userId
      },
      chatroom: {
        blockedUsers = []
      }
    } = chatroomData;
    const found = blockedUsers.findIndex(({ id }) => id === userId);
    this.#nodes.messageForm.inert = found !== -1;
  }

  #chatroomMessagesHandler({ user = {}, raw }) {
    const {
      customName:nickname = '',
      isAdmin = false
    } = user;
    let data;

    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
      data = {};
    }

    const { type = '', content = '' } = data;
    const admin = isAdmin ? 'y' : 'n';
    switch (type) {
      case 'hostMessage':
        this.#renderMessage({ host: nickname, message: content, admin });
        break;

      case 'userMessage':
        this.#renderMessage({ host: nickname, message: content });
        break;

      case 'enterRoom':
        this.#renderMessage({ host: nickname, message: this.l10n.jointhecrowd, admin });
        break;

      case 'grabListing':
        if (!isAdmin) {
          this.#renderMessage({ host: nickname, message: this.l10n.rushbuying, rushbuying: true });
        }
        break;

      case 'addCart':
        if (!isAdmin) {
          this.#renderMessage({ host: nickname, message: this.l10n.rushbuying, rushbuying: true });
        }
        break;

      case 'favoriteHost':
        if (!isAdmin) {
          this.#renderMessage({ host: nickname, message: this.l10n.addfavorite });
        }
        break;

      case 'shareLive':
        this.#renderMessage({ host: nickname, message: this.l10n.sharelive, admin });
        break;

      case 'screenshot':
        this.#renderMessage({ host: nickname, message: this.l10n.takesnapshot, admin });
        break;

      case 'trophy':
        this.#renderMessage({ host: nickname, message: content, admin });
        break;

      case 'carousel': {
        const { text = '' } = content || {};
        this.#renderMessage({ message: text, announce: true });
        break;
      }

      case 'sellingListing': {
        const { id = '' } = content || {};
        const products = this.products.reduce(
          (acc, product) => {
            const { uuid = '' } = product;

            return acc.concat({
              ...product,
              broadcasting: uuid === id
            });
          }
        , []);

        this.products = products;
        break;
      }
    }
  }

  #sendCustomCounterMessage(type = '', content = '') {
    const { chatroom } = this.#data;
    
    if (!chatroom || !type) {
      return;
    }

    try {
      chatroom.sendCustomCounterMessage({
        key: type,
        value: content
      });
    } catch (err) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
    }
  }

  /*
  #sendCustomMessage(type = '', content = {}) {
    const { chatroom } = this.#data;
    
    if (!chatroom || !type || !content) {
      return;
    }

    try {
      chatroom.sendCustomMessage({
        value: JSON.stringify({ type, content })
      });
    } catch (err) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
    }
  }
  */

  #sendTextMessage(type = '', content = '') {
    const { chatroom } = this.#data;
    
    if (!chatroom || !type || !content) {
      return;
    }

    try {
      chatroom.sendTextMessage({
        text: JSON.stringify({ type, content })
      });
    } catch (err) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
    }
  }

  /*
  sendTextMessage(type = '', content = '') {
    this.#sendTextMessage(type, content);
  }

  sendCustomMessage(type = '', content = {}) {
    this.#sendCustomMessage(type, content);
  }
  */

  async #setupPlayer() {
    const { container } = this.#nodes;

    // remove exist
    if (this.#data.player) {
      if (this.#data.controllerForVideo) {
        this.#data.controllerForVideo.abort();
      }

      this.#data.player.release();
      container.replaceChildren();
    }

    // playbackSession
    if (this.playerconfig?.playbackToken && !this.#data.playbackSession) {
      try {
        this.#data.playbackSession = await window.BlendVisionLinkSDK.startPlaybackSession({
          token: this.playerconfig?.playbackToken
        });
      } catch(err) {
        console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
      }
    }

    // player
    const player = window.BlendVision.createPlayer(container, {
      ...this.playerconfig,
      onPlaylogFired: (eventType = '') => {
        // LIVE ended
        if (eventType === 'playback_video_ended') {
          const { chatroomData, likeCount } = this.#data;

          this.#fireEvent(custumEvents.liveEnded, {
            count: this.host.count,
            createdAt: chatroomData?.createdAt,
            likeCount
          });
        }
      }
    });

    this.#data.player = player;

    requestAnimationFrame(
      () => {
        player.switchControlMode('HIDE');

        // recover t
        if (this.dataset.t) {
          player.seek(+this.dataset.t);
        }

        const video = container.querySelector('video');
        this.#nodes.video = video;

        video.playsinline = true;
        video.controls = false;

        // picture in picture
        if (this.#data.anyPipEnable || !pipEnabled) {
          video.disablePictureInPicture = false;
        }

        // events
        this.#data.controllerForVideo = new AbortController();
        const signal = this.#data.controllerForVideo.signal;
        const playerEvents = ['canplay', 'ended', 'progress', 'timeupdate', 'play', 'pause', 'volumechange', 'seeking'];

        playerEvents.forEach((event) => player.addEventListener(event, this._playerEventsHandler));
        video.addEventListener('click', this._onStageClick , { signal });
        video.addEventListener('contextmenu', this._onContextmenu, { signal });
        video.addEventListener('dblclick', this._onDblclick , { signal });

        if (!video.disablePictureInPicture) {
          video.addEventListener('enterpictureinpicture', this._onEnterpictureinpicture , { signal });
        }

        video.loop = this.loop;
        video.poster = this.poster;

        // autoplay stuff (web component should set attribute "autoplay")
        setTimeout(
          () => {
            if (this.hasAttribute('autoplay')) {
              this.removeAttribute('autoplay');
              player.setVolume(0);
              player.play();
            } else if (this.paused) {
              this.#reaction('play', true);
            }
          }
        , 500);
      }
    );
  }

  #reaction(action = 'play', isStatic = false) {
    const { reactions } = this.#nodes;

    reactions.replaceChildren();
    const templateString = Mustache.render(templateReaction.innerHTML, { action, isStatic });
    reactions.insertAdjacentHTML('afterbegin', templateString);
    const reaction = reactions.querySelector('.reaction');

    requestAnimationFrame(
      () => reaction.dataset.active = true
    );
  }

  #clearClock() {
    if (this.#data.tid) {
      clearTimeout(this.#data.tid);
    }

    this.#nodes.main.dataset.mode = 'normal';
  }

  #resetClock() {
    this.#clearClock();
    this.#data.tid = setTimeout(
      () => {
        this.#nodes.main.dataset.mode = 'clear';
      }
    , clearDelay);
  }

  _onMouseEventsHandler() {
    this.paused ? this.#clearClock() : this.#resetClock();
  }

  #setMediaSession() {
    if (!navigator?.mediaSession) {
      return;
    }

    const tagName = _wcl.classToTagName(this.constructor.name);
    const components = Array.from(document.querySelectorAll(tagName));
    const currentIndex = components.indexOf(this);
    const playerPrevious = components[currentIndex - 1];
    const playerNext = components[currentIndex + 1];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: this.playerconfig.title,
      artist: this.host.name,
      album: 'Yahoo 拍賣',
      artwork: [
        { src: this.poster, sizes: '512x512', type: 'image/jpg' }
      ]
    });

    const trackHandler = (player) => {
      if (window?.documentPictureInPicture?.window) {
        window?.documentPictureInPicture?.window.close();
      }

      this.pause();
      player.scrollIntoView({ behavior:'smooth', block:'center' });
      player.play();
    };

    navigator.mediaSession.setActionHandler('seekbackward', () => this._onKeydown({ key: 'j' }));
    navigator.mediaSession.setActionHandler('seekforward', () => this._onKeydown({ key: 'l' }));
    
    // previous track
    if (playerPrevious) {
      navigator.mediaSession.setActionHandler('previoustrack', () => trackHandler(playerPrevious));
    } else {
      navigator.mediaSession.setActionHandler('previoustrack', null);
    }

    // next track
    if (playerNext) {
      navigator.mediaSession.setActionHandler('nexttrack', () => trackHandler(playerNext));
    } else {
      navigator.mediaSession.setActionHandler('nexttrack', null);
    }

    // document picture in picture
    if (this.#data.anyPipEnable) {
      navigator.mediaSession.setActionHandler('enterpictureinpicture',
        () => {
          const anyPip = this.parentNode;
          anyPip.requestPictureInPicture();
        }
      );
    }
  }

  _playerEventsHandler(evt) {
    const { type } = evt;
    const { player } = this.#data;

    switch (type) {
      case 'canplay': {
        const { btnMutes, progress, progressBuffer, progressDuration, timePassed, timeEnded } = this.#nodes;
        const currentTime = player.currentTime();
        const duration = player.getDuration();
        const muted = this.muted;

        progress.max = duration;
        progressBuffer.max = duration;
        progressDuration.max = duration;
        btnMutes.forEach((button) => button.toggleAttribute('data-reverse', muted));

        timePassed.textContent = this.#timeFormat(currentTime);
        timeEnded.textContent = this.#timeFormat(duration);
        break;
      }

      case 'timeupdate': {
        const { progress, progressDuration, timePassed } = this.#nodes;
        const currentTime = player.currentTime();

        progress.value = currentTime;
        progressDuration.value = currentTime;
        timePassed.textContent = this.#timeFormat(currentTime);

        if (currentTime !== 0) {
          this.dataset.t = currentTime;
        }

        this.#recallMessages(currentTime);
        break;
      }

      case 'play':
        this.#nodes.btnPlay.toggleAttribute('data-reverse', true);
        this.#nodes.btnPlay.dataset.type = '';
        this.#reaction('play');
        // this.#resetClock();

        // poster hidden
        if (!this.#nodes.poster.hidden) {
          this.#nodes.poster.hidden = true;
        }

        this.#setMediaSession();

        this.#fireEvent(custumEvents.play);
        break;

      case 'pause':
        this.#nodes.btnPlay.toggleAttribute('data-reverse', false);
        this.#reaction('pause');
        // this.#clearClock();

        this.#fireEvent(custumEvents.pause);
        break;

      case 'volumechange': {
        const muted = this.muted;

        this.#nodes.btnMutes.forEach((button) => button.toggleAttribute('data-reverse', muted));
        this.#reaction(muted ? 'mute' : 'unmute');
        // this.#clearClock();
        break;
      }

      case 'ended':
        this.#nodes.btnPlay.dataset.type = 'replay';
        this.#nodes.poster.hidden = false;
        this.classList.remove('yahoo-x-bv-player--refreshing');
        // this.#clearClock();

        this.#fireEvent(custumEvents.ended);
        break;

      case 'seeking':
        // this.paused ? this.#clearClock() : this.#resetClock();
        this.#nodes.btnPlay.dataset.type = '';
        this.#fireEvent(custumEvents.seeking);
        break;

      case 'progress': {
        const { progressBuffer, video } = this.#nodes;
        const { buffered = [] } = video;

        if (buffered.length) {
          const loaded = buffered.end(buffered.length - 1);
          
          progressBuffer.value = loaded || 0;
        }
        break;
      }
    }
  }

  _onDblclick() {
    this.#nodes.btnFullscreens[0].click();
  }

  _onStageClick() {
    this.#nodes.btnPlay.click();
  }

  async _onFullscreenchange() {
    const fullscreened = document.fullscreenElement === this;
    this.#nodes.btnFullscreens.forEach((button) => button.toggleAttribute('data-reverse', fullscreened));
    // this.#resetClock();

    if (keyboardLockEnabled) {
      if (document.fullscreenElement) {
        await navigator.keyboard.lock(['Escape']);
      } else {
        navigator.keyboard.unlock();
      }
    }
  }

  _onProgressInput(evt) {
    const { progress } = this.#nodes;
    const { player } = this.#data;

    evt.stopPropagation();
    player.seek(+progress.value);

    this.#nodes.btnPlay.dataset.type = '';

    // poster hidden
    if (!this.#nodes.poster.hidden) {
      this.#nodes.poster.hidden = true;
    }

    // this.#clearClock();
  }

  _onReactionAnimationend() {
    this.#nodes.reactions.replaceChildren();
  }

  _onKeydown(evt) {
    const { key, preventDefault, target = {} } = evt;
    const { player } = this.#data;
    const { main, btnPlay, btnMutes, btnFullscreens, btnScreenshots } = this.#nodes;
    const isInput = target?.tagName?.toLowerCase() === 'input';

    if (!YahooXBvPlayer.supportKeyboardKeys.includes(key) || isInput) {
      return;
    }

    if (preventDefault) {
      evt.preventDefault();
    }

    switch (key) {
      case ' ':
      case 'k':
        btnPlay.click();
        break;

      case 's':
        btnScreenshots[0].click();
        break;

      case 'm':
        btnMutes[0].click();
        break;

      case 'f':
        btnFullscreens[0].click();
        break;

      case 'l': {
        const currentTime = player.currentTime();

        player.seek(currentTime + 10);
        this.#reaction('forward10');
        break;
      }

      case 'j': {
        const currentTime = player.currentTime();

        player.seek(currentTime - 10);
        this.#reaction('replay10');
        break;
      }

      case 'ArrowRight': {
        const currentTime = player.currentTime();

        player.seek(currentTime + 5);
        this.#reaction('forward5');
        break;
      }

      case 'ArrowLeft': {
        const currentTime = player.currentTime();

        player.seek(currentTime - 5);
        this.#reaction('replay5');
        break;
      }

      case 'Escape': {
        if (!fullscreenEnabled && main.dataset.fullscreen === 'true') {
          main.dataset.fullscreen = 'false';
        }
        break;
      }
      
      default:
        player.seek((+key * 10) / 100 * player.getDuration());
    }

    // this.#resetClock();
  }

  _onEnterpictureinpicture() {
    if (!fullscreenEnabled) {
      this.#nodes.main.dataset.fullscreen = 'false';
    }
    // this.#clearClock();
  }

  _onContextmenu(evt) {
    evt.preventDefault();
  }

  _onCancelRefreshing() {
    this.classList.remove('yahoo-x-bv-player--refreshing');
  }

  #prepareDialogClose() {
    const { dialog } = this.#nodes;

    if (!dialog.open) {
      return;
    }

    dialog.addEventListener(
      'animationend',
      () => {
        dialog.removeAttribute('close');
        dialog.close();
      },
      { once: true }
    );

    dialog.toggleAttribute('close', true);
  }

  _onDialogCancel(evt) {
    evt.preventDefault();

    this.#prepareDialogClose();
  }

  _onDialogButtonsClick(evt) {
    const button = evt.target.closest('button');

    if (!button) {
      return;
    }

    const { dialog } = this.#nodes;
    const action = button.dataset.action;

    if (action === 'open') {
      if (!dialog.open) {
        dialog.showModal();
        if (this.#isLIVE()) {
          this.#sendTextMessage('grabListing', this.l10n.rushbuying);
        }
      }
    } else {
      this.#prepareDialogClose();
    }
  }

  _onListingsClick(evt) {
    const button = evt.target.closest('button');

    if (!button) {
      return;
    }

    evt.preventDefault();

    const sn = +button.dataset.sn;

    this.#fireEvent(custumEvents.purchaseClick, { ...this.products[sn] });

    if (this.#isLIVE()) {
      this.#sendTextMessage('grabListing', this.l10n.rushbuying);
    }
  }

  #renderMessage({ host = '', message = '', admin = 'n', rushbuying = false, announce = false } = {}) {
    if (!message.trim()) {
      return;
    }

    const { messages } = this.#nodes;

    const id = `message-${_wcl.getRandomIntInclusive(1, 100)}-${_wcl.getRandomIntInclusive(1, 10000)}`;
    const messageString = Mustache.render(templateMessage.innerHTML, { id, host, message, admin, rushbuying, announce });
    messages.insertAdjacentHTML('beforeend', messageString);

    requestAnimationFrame(
      () => {
        const unit = messages.querySelector(`#${id}`);
        
        if (unit) {
          unit.dataset.active = true;
        }
      }
    );

    // make message unit less than maxMessageCount
    const units = Array.from(messages.querySelectorAll('.chatroom__messages__unit'));
    const count = units.length;
    if (count > maxMessageCount) {
      units.slice(0, count - maxMessageCount).forEach((unit) => unit.remove());
    }
  }

  #recallMessages(time = 0) {
    const { recallKey = '', historyMessages = {} } = this.#data;
    const key = Math.floor(time);

    if (this.type !== 'replay' || !historyMessages[key] || recallKey === key) {
      return;
    }

    this.#data.recallKey = key;

    historyMessages[key].forEach(
      (data) => {
        this.#chatroomMessagesHandler(data);
      }
    );
  }

  #digestEmotions() {
    clearTimeout(this.#data.tidForDigestEmotions);

    this.#data.tidForDigestEmotions = setTimeout(
      () => {
        this.#digestEmotionsEns();
      }
    , _wcl.getRandomIntInclusive(100, 300));
  }

  #digestEmotionsEns() {
    this.#renderEmotion();
    this.#data.reserveLikeCount -= 1;

    if (this.#data.reserveLikeCount <= 0) {
      this.#data.reserveLikeCount = this.autopilot ? 1 : 0;
    }

    if (this.#data.reserveLikeCount > 0) {
      this.#digestEmotions();
    }
  }

  #renderEmotion() {
    const { emotions } = this.#nodes;
    const id = `emotion-${_wcl.getRandomIntInclusive(1, 100)}-${_wcl.getRandomIntInclusive(1, 10000)}`;
    const sign = _wcl.getRandomIntInclusive(1, 9);
    const angle = _wcl.getRandomIntInclusive(1, 31);
    const emotionString = Mustache.render(templateEmotion.innerHTML, { id, sign, angle });

    emotions.insertAdjacentHTML('beforeend', emotionString);

    requestAnimationFrame(
      () => {
        const unit = emotions.querySelector(`#${id}`);
        
        if (unit) {
          unit.dataset.active = true;
        }
      }
    );
  }

  #isLIVE() {
    return this.type === 'live';
  }

  _onMessageSubmit(evt) {
    const { messageInput } = this.#nodes;
    const message = messageInput.value;

    evt.preventDefault();

    if (!message) {
      return;
    }

    if (this.#data.chatroom) {
      const {
        chatroomData: {
          user: {
            isAdmin = false
          } = {}
        } = {}
      } = this.#data;
      const type = `${isAdmin ? 'host' : 'user'}Message`;
      this.#sendTextMessage(type, message);
    } else {
      const host = ['左邊來的粉絲', '右邊來的粉絲', '上面來的粉絲', '下面來的粉絲'].sort(() => Math.random() - 0.5)[0];
      this.#renderMessage({ host, message });
    }

    messageInput.value = '';
  }

  _onEmotionAnimationend(evt) {
    const { animationName, target } = evt;

    if (animationName !== 'emotion-show-up') {
      return;
    }

    const unit = target.closest('.emotion-unit');
    unit.remove();
  }

  _onButtonFollowClick(evt) {
    const { btnFollow } = this.#nodes;
    
    evt.preventDefault();

    const followed = btnFollow.hasAttribute('data-reverse');
    this.#fireEvent(custumEvents.followClick, { follow: !followed });

    if (this.#isLIVE() && !followed) {
      this.#sendTextMessage('favoriteHost', this.l10n.addfavorite);
    }
  }

  #socketMessageHandler(data) {
    const { messages = [] } = data;
    const message = messages[0] || {};
    const {
      type = '',
      attribute: {
        nickname = '',
        price = '',
        listingId = ''
      } = {}
    } = message;

    switch (type) {
      case 'highestBid': {
        this.#renderMessage({ host: nickname, message: this.l10n.highestbid.replace(/\{\{price\}\}/g, +price) });
        break;
      }

      case 'exceededBid': {
        this.#renderMessage({ message: this.l10n.exceededbid.replace(/\{\{price\}\}/g, +price) });
        break;
      }

      case 'wonBid': {
        this.#renderMessage({ host: nickname, message: this.l10n.wonbid.replace(/\{\{price\}\}/g, +price) });
        break;
      }

      case 'cancelledPlaceBid': {
        this.#renderMessage({ message: this.l10n.cancelledplacebid.replace(/\{\{nickname\}\}/g, nickname) });
        break;
      }

      case 'placeBid': {
        this.#renderMessage({ host: nickname, message: this.l10n.placebid.replace(/\{\{price\}\}/g, +price) });
        break;
      }

      case 'addListing': {
        this.#fireEvent(custumEvents.addProduct, { id: listingId });
        break;
      }
    }
  }

  _socketEventsHandler(evt) {
    const { type } = evt;
    const { socket } = this.#data;

    switch (type) {
      case 'open': {
        const { id } = this.ysocket;
        const data = {
          action: 'join',
          chatRoom: {
            id
          }
        };

        socket.send(JSON.stringify(data));
        break;
      }

      case 'message': {
        const { data = '{}' } = evt;

        try {
          const payload = JSON.parse(data);
          this.#socketMessageHandler(payload);
        } catch(err) {
          console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
        }
        break;
      }

      case 'error': {
        console.warn(`${_wcl.classToTagName(this.constructor.name)} socket: ${evt}`);
        break;
      }
    }
  }

  async _onControlsButtonClick(evt) {
    const button = evt.target.closest('button');

    if (!button) {
      return;
    }

    evt.stopPropagation();

    const action = button.dataset.action;
    const { player } = this.#data;
    const { main, video, btnPlay } = this.#nodes;
    
    switch (action) {
      case 'play':
        player[this.paused ? 'play' : 'pause']();
        btnPlay.dataset.type = '';
        break;

      case 'mute':
        player[player.getVolume() === 0 ? 'unmute' : 'mute']();
        break;

      case 'screenshot': {
        if (this.currentTime === 0) {
          return;
        }

        const { videoWidth, videoHeight } = video;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = videoWidth;
        canvas.height = videoHeight;
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

        const link = document.createElement('a');
        link.download = `${_wcl.classToTagName(this.constructor.name)}_${+new Date()}_${this.currentTime.toFixed(1)}s.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        ctx.clearRect(0, 0, videoWidth, videoHeight);
        
        if (this.#isLIVE()) {
          this.#sendTextMessage('screenshot', this.l10n.takesnapshot);
        }
        break;
      }

      case 'share': {
        try {
          await navigator.share(this.share);
        } catch (err) {
          console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
        }
        // this.#clearClock();

        if (this.#isLIVE()) {
          this.#sendTextMessage('shareLive', this.l10n.sharelive);
        }
        break;
      }

      case 'refreshing':
        this.classList.add('yahoo-x-bv-player--refreshing');
        break;

      case 'pip': {
        if (pipEnabled) {
          if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
          } else {
            video.requestPictureInPicture();

            // exit fullscreen
            if (!fullscreenEnabled) {
              main.dataset.fullscreen = 'false';
            }
          }
          // this.#clearClock();
        }
        break;
      }

      case 'emotion': {
        this.#renderEmotion();

        this.#data.userLikeCount++;
        this.#data.likeCount++;
        this.#sendCustomCounterMessage('like');

        // trophy
        const { trophyMilestones = [], userLikeCount } = this.#data;
        if (this.#isLIVE() && trophyMilestones.length) {
          const findIndex = trophyMilestones.findIndex((milestone) => userLikeCount >= milestone);
          
          if (findIndex !== -1) {
            const milestone = trophyMilestones.splice(findIndex, 1);
            this.#data.trophyMilestones = trophyMilestones;
            this.#sendTextMessage('trophy', this.l10n.achievetrophy.replace(/\{\{hits\}\}/g, milestone[0]));
          }
        }
        break;
      }

      case 'fullscreen': {
        const inPiP = window?.documentPictureInPicture?.window?.document?.body?.contains?.(this);

        if (!inPiP) {
          if (fullscreenEnabled) {
            if (!document.fullscreenElement) {
              main.requestFullscreen();
            } else if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          } else {
            const fullscreenElement = main.dataset.fullscreen === 'true';

            main.dataset.fullscreen = fullscreenElement ? 'false' : 'true';
            // this.#resetClock();

            // exit pip
            if (pipEnabled && document.pictureInPictureElement) {
              document.exitPictureInPicture();
            }
          }
        }
        break;
      }
    }
  }

  play() {
    this.#data.player.play();
  }

  pause() {
    this.#data.player.pause();
  }
}

// define web component
const S = _wcl.supports();
const T = _wcl.classToTagName('YahooXBvPlayer');
if (S.customElements && S.shadowDOM && S.template && !window.customElements.get(T)) {
  window.customElements.define(_wcl.classToTagName('YahooXBvPlayer'), YahooXBvPlayer);
}