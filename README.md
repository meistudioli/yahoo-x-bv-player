# yahoo-x-bv-player

[![DeepScan grade](https://deepscan.io/api/teams/16372/projects/27688/branches/888679/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=16372&pid=27688&bid=888679)

yahoo-x-bv-player is a video player web component which based on BlendVision Web SDK. It has not only LIVE but also REPLAY features for Yahoo Auction. Sellers could display their products through this player and interact with buyers. We believe this could help them increase commerce conversion rate.

![<yahoo-x-bv-player />](https://blog.lalacube.com/mei/img/preview/yahoo-x-bv-player.png)

## Basic Usage

&lt;yahoo-x-bv-player /> is a web component. All we need to do is put the required script into your HTML document. Then follow &lt;yahoo-x-bv-player />'s html structure and everything will be all set.

- Required Script

```html
<script
  type="module"
  src="https://unpkg.com/yahoo-x-bv-player/mjs/wc-yahoo-x-bv-player.js">        
</script>
```

- Structure

Put &lt;yahoo-x-bv-player /> into HTML document. It will have different functions and looks with attribute mutation.

```html
<yahoo-x-bv-player>
  <script type="application/json">
    {
      "type": "live",
      "playerconfig": {
        "licenseKey": "your-BlendVision-player-license",
        "title": "Yahoo Auction",
        "source": [
          {
            "type": "video/mp4",
            "src": "https://your-domain/video-source.mp4"
          }
        ],
        "modulesConfig": {
          "analytics.resourceId": "<live-id>",
          "analytics.resourceType": "RESOURCE_TYPE_LIVE_EVENT"
        }
      },
      "chatroomconfig": {
        "token": "your.BV.chatroom.token",
        "refreshToken": "your.BV.chatroom.refreshToken",
        "host": "https://api.one.blendvision.com"
      },
      "share": {
        "title": "Yahoo X BlendVision",
        "text": "This is a Yahoo X BlendVision video player.",
        "url": "https://your-domain/share.html"
      },
      "poster": "https://your-domain/poster.jpg",
      "loop": false,
      "autopilot": false,
      "host": {
        "avatar": "https://your-domain/host-avatar.png",
        "name": "host name",
        "link": "https://your-domain/host",
        "count": 999,
        "announce": "content which host like to announce",
        "follow": false
      },
      "l10n": {
        "previewtrigger": "View",
        "listingshead": "Products",
        "buynow": "BUY NOW",
        "jointhecrowd": "joined the crowd.",
        "rushbuying": "is rush buying.",
        "addfavorite": "added host as favorite.",
        "sharelive": "shared this LIVE.",
        "takesnapshot": "took snapshot.",
        "achievetrophy": "achieved {{hits}} likes."
      },
      "messagetemplate": [
        "👍",
        "+1",
        "被燒🔥",
        "尺寸？",
        "材質？",
        "多少錢？"
      ],
      "products": [
        {
          "id": "A1234567890",
          "uuid": "334c6ea9-244e-4a6c-b320-d3506b4d6d91",
          "title": "product title",
          "link": "https://your-domain/product.html",
          "thumbnail": "https://your-domain/img/product.jpg",
          "price": "$ 9,999",
          "bestDiscount": "-40%",
          "marks": {
            "coupon": true,
            "shippingCoupon": false,
            "buynow": true
          },
          "buyCount": 1,
          "broadcasting": true
        },
        ...
      ]
    }
  </script>
</yahoo-x-bv-player>
```

Otherwise, developers could also choose remoteconfig to fetch config for &lt;yahoo-x-bv-player />.

```html
<yahoo-x-bv-player
  remoteconfig="https://your-domain/api-path"
>
  ...
  ...
  ...
</yahoo-x-bv-player>
```

## JavaScript Instantiation

&lt;yahoo-x-bv-player /> could also use JavaScript to create DOM element. Here comes some examples.

```html
<script type="module">
import { YahooXBvPlayer } from 'https://unpkg.com/yahoo-x-bv-player/mjs/wc-yahoo-x-bv-player.js';

// use DOM api
const nodeA = document.createElement('yahoo-x-bv-player');
document.body.appendChild(nodeA);
nodeA.playerconfig = {
  licenseKey: 'your-BlendVision-player-license',
  title: 'Yahoo Auction',
  source: [
    {
      type: 'video/mp4',
      src: 'https://your-domain/video-source.mp4'
    }
  ]
};
nodeA.share = {
  title: 'Yahoo X BlendVision',
  text: 'This is a Yahoo X BlendVision video player.',
  url: 'https://blog.lalacube.com/mei/webComponent_yahoo-x-bv-player.html'
};
nodeA.loop = true;

// new instance with Class
const nodeB = new YahooXBvPlayer();
document.body.appendChild(nodeB);
nodeB.playerconfig = {
  licenseKey: 'your-BlendVision-player-license',
  title: 'Yahoo Auction',
  source: [
    {
      type: 'video/mp4',
      src: 'https://your-domain/video-source.mp4'
    }
  ]
};
nodeB.share = {
  title: 'Yahoo X BlendVision',
  text: 'This is a Yahoo X BlendVision video player.',
  url: 'https://blog.lalacube.com/mei/webComponent_yahoo-x-bv-player.html'
};
nodeB.loop = true;

// new instance with Class & default config
const config = {
  playerconfig: {
    licenseKey: 'your-BlendVision-player-license',
    title: 'Yahoo Auction',
    source: [
      {
        type: 'video/mp4',
        src: 'https://your-domain/video-source.mp4'
      }
    ]
  },
  share: {
    title: 'Yahoo X BlendVision',
    text: 'This is a Yahoo X BlendVision video player.',
    url: 'https://blog.lalacube.com/mei/webComponent_yahoo-x-bv-player.html'
  }
};
const nodeC = new YahooXBvPlayer(config);
document.body.appendChild(nodeC);
</script>
```

## Style Customization

Developers could apply styles to decorate &lt;yahoo-x-bv-player />'s looking.

```html
<style>
yahoo-x-bv-player {
  /* main padding */
  --yahoo-x-bv-player-padding-inline-basis: 12px;
  --yahoo-x-bv-player-padding-block-end-basis: 8px;

  /* video */
  --yahoo-x-bv-player-video-object-fit: contain;

  /* progress */
  --yahoo-x-bv-player-slider-thumb-color: rgba(234 51 35);
  --yahoo-x-bv-player-slider-thumb-shadow-color: rgba(0 0 0);
  --yahoo-x-bv-player-indicator-background: rgba(255 255 255/.2);
  --yahoo-x-bv-player-indicator-buffer-start: rgba(255 255 255/.4);
  --yahoo-x-bv-player-indicator-buffer-end: rgba(255 255 255/.4);
  --yahoo-x-bv-player-indicator-duration-start: rgba(234 51 35);
  --yahoo-x-bv-player-indicator-duration-end: rgba(234 51 35);

  /* time information */
  --yahoo-x-bv-player-time-info-text-color: rgba(255 255 255);

  /* buttons */
  --yahoo-x-bv-player-button-icon-color: rgba(255 255 255);
  --yahoo-x-bv-player-button-focus-visible-background-color: rgba(0 0 0/.5);

  /* dialog */
  --yahoo-x-bv-player-dialog-background-color: rgba(255 255 255);
  --yahoo-x-bv-player-dialog-backdrop-color: rgba(35 42 49/.6);
  --yahoo-x-bv-player-dialog-head-text-color: rgba(35 42 49);
  --yahoo-x-bv-player-dialog-listing-title-color: rgba(35 42 49);
  --yahoo-x-bv-player-dialog-line-color: rgba(199 205 210);
  --yahoo-x-bv-player-dialog-listing-price-color: rgba(235 15 41);
  --yahoo-x-bv-player-dialog-listing-hover-color: rgba(240 243 245);
  --yahoo-x-bv-player-dialog-listing-broadcasting-color: rgba(255 211 51/.3);
  --yahoo-x-bv-player-dialog-close-hover-background-color: rgba(245 248 250);
  --yahoo-x-bv-player-dialog-close-icon-color: rgba(95 99 104);
  --yahoo-x-bv-player-dialog-listing-buynow-color: rgba(0 99 235);

  /* message input */
  --yahoo-x-bv-player-live-controls-input-text-color: rgba(255 255 255);
  --yahoo-x-bv-player-live-controls-input-placeholder-color: rgba(255 255 255/.5);
  --yahoo-x-bv-player-live-controls-form-background-color: rgba(0 0 0/.75);

  /* chatroom */
  --yahoo-x-bv-player-chatroom-message-owner-text: 'HOST';
  --yahoo-x-bv-player-chatroom-message-owner-text-color: rgba(255 255 255);
  --yahoo-x-bv-player-chatroom-message-owner-background-color: rgba(255 82 13);

  /* host */
  --yahoo-x-bv-player-host-count-text: 'viewers';

  /* poster */
  --yahoo-x-bv-player-poster-background-color: rgba(0 0 0);

  /* listings' text */
  --yahoo-x-bv-player-broadcasting-text: 'ON AIR';
  --yahoo-x-bv-player-listing-sign-shipping-coupon-text: '運費抵用券';
  --yahoo-x-bv-player-listing-sign-coupon-text: '折扣碼';
  --yahoo-x-bv-player-listing-sign-buynow-text: '直購';
  --yahoo-x-bv-player-listing-sign-bid-text: '競標';
  --yahoo-x-bv-player-listing-sold-start-text: '售出';
  --yahoo-x-bv-player-listing-sold-end-text: '件';

  /* emotions (1 ~ 9) */
  --yahoo-x-bv-player-emotion-sign-1: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0nI0ZDREExOScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI0ZGNEQ1MicgZD0nTTYuNDIzIDE0LjQxM2MuODEgMS4wNjggMi4wNyAxLjc4IDMuNjYyIDEuNzggMS42MzEgMCAyLjg5MS0uNjA3IDMuNzcyLTEuNjExYTQuODEgNC44MSAwIDAgMCAuNzI1LTEuMWMuMTEyLS4yMzQuMTgyLS40MjcuMjE5LS41NmExIDEgMCAwIDAtMS45MjgtLjUzbC0uMDEzLjAzN2EyLjgzOCAyLjgzOCAwIDAgMS0uNTEuODQ1Yy0uNTEyLjU4NC0xLjIzLjkzLTIuMjY1LjkzLS45MiAwLTEuNjEyLS4zOS0yLjA2NS0uOTg4YTEuMDA0IDEuMDA0IDAgMCAwLTEuNC0uMTk1Ljk5Ljk5IDAgMCAwLS4xOTcgMS4zOTJaJy8+PHBhdGggZmlsbD0nIzVGNUY1RicgZD0nTTkuNTI0IDYuMjk4Yy0uMTgyLS41OTMtLjczMi0uOTk0LTEuNDg2LS45OTRIMy44ODZjLTEuMTA0IDAtMS43Ny44Ni0xLjQ4OCAxLjkyMmwuMyAxLjEyOGMuMjgyIDEuMDYyIDEuNDA4IDEuOTIyIDIuNTE0IDEuOTIyaDEuNWMxLjEwNSAwIDIuMjMxLS44NiAyLjUxMy0xLjkyMmwuMDE4LS4wNjdoMi4xMDRsLjAxOC4wNjdjLjI4MiAxLjA2MSAxLjQwOCAxLjkyMiAyLjUxNCAxLjkyMmgxLjQ5OWMxLjEwNiAwIDIuMjMyLS44NiAyLjUxNC0xLjkyMmwuMy0xLjEyOGMuMjgyLTEuMDYyLS4zODQtMS45MjItMS40ODgtMS45MjJoLTQuMTUyYy0uNzU0IDAtMS4zMDMuNDAxLTEuNDg2Ljk5NEg5LjUyNFonLz48L3N2Zz4=);
  --yahoo-x-bv-player-emotion-sign-2: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0ndXJsKCNhKScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nIzVGNUY1RicgZD0nTTEzLjYzNiA2LjUxYy0uOTA0IDAtMS42MzYuNzI4LTEuNjM2IDEuNjI2IDAgLjkuNzMyIDEuNjI4IDEuNjM2IDEuNjI4LjkwNCAwIDEuNjM3LS43MjggMS42MzctMS42MjggMC0uODk4LS43MzMtMS42MjctMS42MzctMS42MjdaJy8+PHBhdGggZmlsbD0nI0ZGNEQ1MicgZD0nTTUuNTE5IDEzLjMyM2MuNjU2IDEuNzE1IDIuNDkgMi45NSA0LjY1MiAyLjk1IDIuMTYgMCAzLjk5NS0xLjIzNSA0LjY1MS0yLjk1LjI1OS0uNjc1LS4zLTEuMzktMS4wNC0xLjM5SDYuNTZjLS43NDEgMC0xLjMuNzE1LTEuMDQxIDEuMzlaJy8+PHBhdGggZmlsbD0nIzVGNUY1RicgZD0nTTcuMDkgOS43NjRjLjkwNSAwIDEuNjM3LS43MjggMS42MzctMS42MjggMC0uODk4LS43MzItMS42MjctMS42MzYtMS42MjctLjkwNCAwLTEuNjM2LjczLTEuNjM2IDEuNjI3IDAgLjkuNzMyIDEuNjI4IDEuNjM2IDEuNjI4WicvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0nYScgeDE9JzEyJyB4Mj0nLTEyJyB5MT0nLTEyJyB5Mj0nMTInIGdyYWRpZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJz48c3RvcCBzdG9wLWNvbG9yPScjRkVFRjM2Jy8+PHN0b3Agb2Zmc2V0PScxJyBzdG9wLWNvbG9yPScjRkNEQTE5Jy8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+);
  --yahoo-x-bv-player-emotion-sign-3: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0nI0ZDREExOScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI0ZDREExOScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI0ZGNEQ1MicgZD0nTTYgMTIuMjY1IDIuODg3IDkuMDIxYTIuMDQ1IDIuMDQ1IDAgMCAxIDAtMi43OTkgMS44NjYgMS44NjYgMCAwIDEgMS4zNTgtLjU4N2MxLjA2MiAwIDEuNTU4Ljg0MyAxLjc1NSAxLjAwMi4yMDMtLjE2NC42ODctMS4wMDIgMS43NTUtMS4wMDIuNTE0IDAgLjk5Ny4yMDkgMS4zNTguNTg3YTIuMDQ1IDIuMDQ1IDAgMCAxIDAgMi43OThMNiAxMi4yNjVaTTE1IDEyLjI2NWwtMy4xMTMtMy4yNDRhMi4wNDUgMi4wNDUgMCAwIDEgMC0yLjc5OSAxLjg2NiAxLjg2NiAwIDAgMSAxLjM1OC0uNTg3YzEuMDYzIDAgMS41NTguODQzIDEuNzU1IDEuMDAyLjIwMy0uMTY0LjY4Ny0xLjAwMiAxLjc1NS0xLjAwMi41MTQgMCAuOTk3LjIwOSAxLjM1OC41ODdhMi4wNDUgMi4wNDUgMCAwIDEgMCAyLjc5OEwxNSAxMi4yNjVaJy8+PHBhdGggZmlsbD0nIzVGNUY1RicgZD0nTTEyLjMzIDE0LjZhMiAyIDAgMSAxLTQgMCAyIDIgMCAwIDEgNCAwWicvPjwvc3ZnPg==);
  --yahoo-x-bv-player-emotion-sign-4: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0ndXJsKCNhKScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI2ZmZicgZD0nTTE1IDQuNjRjLTIuMDI3IDAtMy42NjcgMS42MzQtMy42NjcgMy42NDdBMy42NTUgMy42NTUgMCAwIDAgMTUgMTEuOTMzYzIuMDI0IDAgMy42NjctMS42MyAzLjY2Ny0zLjY0NiAwLTIuMDEzLTEuNjQzLTMuNjQ2LTMuNjY3LTMuNjQ2Wk02IDQuNjRjLTIuMDI2IDAtMy42NjcgMS42MzQtMy42NjcgMy42NDdBMy42NTUgMy42NTUgMCAwIDAgNiAxMS45MzNjMi4wMjQgMCAzLjY2Ny0xLjYzIDMuNjY3LTMuNjQ2IDAtMi4wMTMtMS42NDMtMy42NDYtMy42NjctMy42NDZaJy8+PHBhdGggZmlsbD0nIzVGNUY1RicgZD0nTTE0Ljk3IDkuODg0Yy45MDQgMCAxLjYzNi0uNzI4IDEuNjM2LTEuNjI3IDAtLjg5OC0uNzMyLTEuNjI3LTEuNjM2LTEuNjI3LS45MDUgMC0xLjYzNy43MjktMS42MzcgMS42MjcgMCAuOS43MzIgMS42MjcgMS42MzcgMS42MjdaTTUuOTcgOS44ODRjLjkwNCAwIDEuNjM2LS43MjggMS42MzYtMS42MjcgMC0uODk4LS43MzItMS42MjctMS42MzYtMS42MjctLjkwNSAwLTEuNjM3LjcyOS0xLjYzNyAxLjYyNyAwIC45LjczMiAxLjYyNyAxLjYzNyAxLjYyN1onLz48cGF0aCBmaWxsPScjRkY0RDUyJyBkPSdNOC4zMzMgMTMuOTM0YTIgMiAwIDEgMSA0IDB2My42MjRhMiAyIDAgMCAxLTQgMHYtMy42MjRaJy8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSdhJyB4MT0nMTInIHgyPSctMTInIHkxPSctMTInIHkyPScxMicgZ3JhZGllbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnPjxzdG9wIHN0b3AtY29sb3I9JyNGRUVGMzYnLz48c3RvcCBvZmZzZXQ9JzEnIHN0b3AtY29sb3I9JyNGQ0RBMTknLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=);
  --yahoo-x-bv-player-emotion-sign-5: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0nI0ZDREExOScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI0ZDREExOScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nIzVGNUY1RicgZD0nTTEyLjY0MyA2LjM4OWEuOTk0Ljk5NCAwIDAgMSAxLjQtLjEyM2wyLjA1MiAxLjcyMWEuOTk0Ljk5NCAwIDEgMS0xLjI3OCAxLjUyNEwxMi43NjUgNy43OWEuOTk0Ljk5NCAwIDAgMS0uMTIyLTEuNDAxWk04LjIxOCA2LjM4OWEuOTk0Ljk5NCAwIDAgMC0xLjQwMS0uMTIzTDQuNzY1IDcuOTg3YS45OTQuOTk0IDAgMCAwIDEuMjc5IDEuNTI0TDguMDk1IDcuNzlhLjk5NC45OTQgMCAwIDAgLjEyMy0xLjQwMVonLz48cGF0aCBmaWxsPScjRkY0RDUyJyBkPSdNMTIuMzcgMTUuNzg2YzEuMTY3IDAgMi4wMDUtLjU2MiAyLjQ1NS0xLjQ0NmEzLjIzNCAzLjIzNCAwIDAgMCAuMzQ1LTEuMzMyLjk5Ny45OTcgMCAwIDAtLjk4Mi0xLjAxMy45OTcuOTk3IDAgMCAwLTEuMDE4Ljk3NmMtLjAwMS4wODktLjAzOC4yOS0uMTMuNDctLjEyMy4yNDMtLjI5Mi4zNTYtLjY3LjM1Ni0uNCAwLS42MTUtLjEzNi0uNzc3LS40MWExLjM5MiAxLjM5MiAwIDAgMS0uMTgtLjQ5OGMtLjEyLTEuMTgyLTEuODQ3LTEuMTk3LTEuOTg4LS4wMTYtLjAxMS4wOTktLjA3LjMxMS0uMTkuNTEtLjE2NS4yNzgtLjM3OC40MTQtLjc1Ny40MTQtLjM1MyAwLS41MjUtLjEyLS42Ni0uMzg2YTEuNTE4IDEuNTE4IDAgMCAxLS4xNTItLjUyOC45OTguOTk4IDAgMCAwLTEuMDQ1LS45NDguOTk3Ljk5NyAwIDAgMC0uOTUzIDEuMDM4IDMuNDY4IDMuNDY4IDAgMCAwIC4zNjUgMS4zMzZjLjQ1Ny44OTggMS4yODcgMS40NzcgMi40NDUgMS40NzcuNzkzIDAgMS40NDMtLjI2NSAxLjkzNS0uNzE2LjQ5NS40NTIgMS4xNTIuNzE2IDEuOTU2LjcxNlonLz48cGF0aCBmaWxsPScjRkY0RDUyJyBkPSdNMSAxMS42MDVjMC0uNzMyLjU5My0xLjMyNSAxLjMyNS0xLjMyNWgxLjM1YTEuMzI1IDEuMzI1IDAgMSAxIDAgMi42NWgtMS4zNUExLjMyNSAxLjMyNSAwIDAgMSAxIDExLjYwNVpNMTYuMzMgMTEuNjA1YzAtLjczMi41OTMtMS4zMjUgMS4zMjUtMS4zMjVoMS4zNWExLjMyNSAxLjMyNSAwIDEgMSAwIDIuNjVoLTEuMzVhMS4zMjUgMS4zMjUgMCAwIDEtMS4zMjUtMS4zMjVaJyBvcGFjaXR5PScuMycvPjwvc3ZnPg==);
  --yahoo-x-bv-player-emotion-sign-6: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0nI0ZDREExOScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI0ZGNEQ1MicgZD0nTTcgMTUuMmMwLTEuMTA1Ljg5LTIgMS45ODgtMmg0LjAyNGMxLjA5OCAwIDEuOTg4Ljg5NSAxLjk4OCAycy0uODkgMi0xLjk4OCAySDguOTg4QTEuOTk0IDEuOTk0IDAgMCAxIDcgMTUuMlonLz48cGF0aCBmaWxsPScjZmZmJyBkPSdNNS43MyA1LjM2Yy4xMy0uNDguODA5LS40OC45MzggMGwuNjY2IDIuNDY4IDIuMDc0LjQxNmMuNTIuMTA0LjUyLjg0OCAwIC45NTJsLTIuMDc0LjQxNi0uNjY2IDIuNDY5Yy0uMTMuNDc5LS44MDkuNDc5LS45MzggMGwtLjY2Ni0yLjQ3LTIuMDc0LS40MTVjLS41Mi0uMTA0LS41Mi0uODQ4IDAtLjk1MmwyLjA3NC0uNDE2LjY2Ni0yLjQ2OVpNMTUuMTMgNS4zNmMuMTMtLjQ4LjgwOS0uNDguOTM4IDBsLjY2NiAyLjQ2OCAyLjA3NC40MTZjLjUyLjEwNC41Mi44NDggMCAuOTUybC0yLjA3NC40MTYtLjY2NiAyLjQ2OWMtLjEzLjQ3OS0uODA5LjQ3OS0uOTM4IDBsLS42NjYtMi40Ny0yLjA3NC0uNDE1Yy0uNTItLjEwNC0uNTItLjg0OCAwLS45NTJsMi4wNzQtLjQxNi42NjYtMi40NjlaJy8+PC9zdmc+);
  --yahoo-x-bv-player-emotion-sign-7: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0ndXJsKCNhKScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI2ZmZicgZmlsbC1ydWxlPSdldmVub2RkJyBkPSdtMTguMTkxIDExLjY4OC0uMTY2LjE1NC4wOTQuMjA1Yy4wOC4xNzQuMTIzLjM3LjEyMy41NjYgMCAuMzY3LS4xNjcuNjU0LS40OTYuODUzbC0uMjQ2LjE1LjEyNy4yNTZjLjA4NS4xNzIuMTI4LjM1OC4xMjguNTUgMCAuMzMtLjE2LjU5Ni0uNDg2LjgxNWwtLjIyNy4xNS4xMTcuMjQ1Yy4wNzguMTYyLjExNy4zNDQuMTE3LjU0IDAgLjkwNi0uNzM4IDEuMjYxLTEuMzcgMS4yNjFsLTcuMzg2LjAwN1Y5LjljLjAyMi0uMDM0LjAzNy0uMDYuMDUtLjA4My4wMy0uMDUuMDUtLjA4NS4xMTQtLjE1OC40MjQtLjM2LjgxNC0uNzI1IDEuMTYxLTEuMDg1LjA5Ni0uMS4xOS0uMi4yOC0uMzAxLjc3LS44NTIgMS4wNTItMS41MjUgMS4wMDktMi40YS44NDYuODQ2IDAgMCAxIC4yODgtLjY5M2MuMjY3LS4yMzcuNjc0LS4zMzcgMS4wODktLjI3My43OC4xMjMgMS4zNDIuNzYgMS40NjQgMS42NjMuMTIuODgzLjA1OCAxLjc0Ny0uMTc0IDIuNDMybC0uMTQuNDEzaDMuMjZjLjgyOCAwIDEuNzIyLjUxNCAxLjcyMiAxLjM0NCAwIC4zMy0uMTYuNjYtLjQ1Mi45M1ptLTEyLjgzNCA2LjA2LjAwNi03LjUyOWMwLS4xNjguMTE1LS4zMTMuMzEtLjMxM2gxLjU4MnY4LjE1M0g1LjY3M2EuMzA0LjMwNCAwIDAgMS0uMzE2LS4zMTJaJyBjbGlwLXJ1bGU9J2V2ZW5vZGQnLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2EnIHgxPScxNC4zNzInIHgyPSczNC41NDInIHkxPSczMS4xNycgeTI9JzEwLjA4NScgZ3JhZGllbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnPjxzdG9wIHN0b3AtY29sb3I9JyMzQUJGQkEnLz48c3RvcCBvZmZzZXQ9JzEnIHN0b3AtY29sb3I9JyNGQ0RBMTknLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=);
  --yahoo-x-bv-player-emotion-sign-8: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0ndXJsKCNhKScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI2ZmZicgZD0nbTEyIDE4LjktNS45NDMtNi4xNzdjLTEuNDEtMS40NjktMS40MS0zLjg1OCAwLTUuMzI2YTMuNTcgMy41NyAwIDAgMSA1LjE4NSAwbC43NTguNzkuNzU3LS43OWEzLjU2OCAzLjU2OCAwIDAgMSA1LjE4NyAwYzEuNDA4IDEuNDY4IDEuNDA4IDMuODU3IDAgNS4zMjVMMTIgMTguOVonLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2EnIHgxPScxMS45NzQnIHgyPSczNS45MjInIHkxPSczNS45NzQnIHkyPScxMi4wMjYnIGdyYWRpZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJz48c3RvcCBzdG9wLWNvbG9yPScjRkY0RDUyJy8+PHN0b3Agb2Zmc2V0PScxJyBzdG9wLWNvbG9yPScjRkY4QTAwJy8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+);
  --yahoo-x-bv-player-emotion-sign-9: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgZmlsbD0nbm9uZSc+PHBhdGggZmlsbD0ndXJsKCNhKScgZD0nTTEyIDBjNi42MjcgMCAxMiA1LjM3MyAxMiAxMnMtNS4zNzMgMTItMTIgMTJTMCAxOC42MjcgMCAxMiA1LjM3MyAwIDEyIDBaJy8+PHBhdGggZmlsbD0nI2ZmZicgZD0nTTUuMjE0IDExLjY0OEg3Ljg3VjguNzJoMS43NDR2Mi45MjhoMi42NzJ2MS42NDhIOS42MTR2Mi45MTJINy44N3YtMi45MTJINS4yMTR2LTEuNjQ4Wk0xNS43NDYgMThWOS4xODRsLTIuMjQgMS4zNzYtLjA5Ni0uMDMyVjguNDk2bDIuOTI4LTEuNzc2aDEuODcyVjE4aC0yLjQ2NFonLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2EnIHgxPScxMS45NzQnIHgyPSczNS45MjInIHkxPSczNS45NzQnIHkyPScxMi4wMjYnIGdyYWRpZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJz48c3RvcCBzdG9wLWNvbG9yPScjRkY4QTAwJy8+PHN0b3Agb2Zmc2V0PScuNTknIHN0b3AtY29sb3I9JyNGRkE3MDAnLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=);
}
</style>
```

## Keyboard shortcut

&lt;yahoo-x-bv-player /> also comes with keyboard shortcut. I believe this will make <yahoo-x-bv-player /> more vivid & more useful.

- k：Toggle &lt;yahoo-x-bv-player /> play or pause.
- space：Toggle &lt;yahoo-x-bv-player /> play or pause.
- m：Toggle &lt;yahoo-x-bv-player /> mute or not.
- s：Take a screenshot for current &lt;yahoo-x-bv-player /> video frame.
- f：Toggle &lt;yahoo-x-bv-player /> into fullscreen or not.
- esc：Turn off fullscreen mode.
- ←：&lt;yahoo-x-bv-player /> backward 5 seconds.
- →：&lt;yahoo-x-bv-player /> forward 5 seconds.
- j：&lt;yahoo-x-bv-player /> backward 10 seconds.
- l：&lt;yahoo-x-bv-player /> forward 10 seconds.
- 0 ~ 9：&lt;yahoo-x-bv-player /> jumps to specific timeline. Ex: 7 means to timeline 70%.


## Attributes

&lt;yahoo-x-bv-player /> supports some attributes to let it become more convenience & useful.

- **type**

Set type as live or replay. Default is `live`.

```html
<yahoo-x-bv-player type="live">
  ...
</yahoo-x-bv-player>
```

- **playerconfig**

Set [BlendVision Web SDK](https://www.blendvision.com/zh-tw) config.

`licenseKey`：Set BlendVision player license.\
`title`：Set title.\
`source`：Set video sources.

```html
<yahoo-x-bv-player playerconfig='{"title":"Yahoo Auction","source":[{"type":"video/mp4","src":"https://your-domain/video-source.mp4"}],"licenseKey":"your-BlendVision-player-license"}'>
  ...
</yahoo-x-bv-player>
```

- **chatroomconfig**

Set [BlendVision chatroom SDK](https://www.npmjs.com/package/@blendvision/chatroom-javascript-sdk) config.

`token`：Set BlendVision chatroom token.\
`refreshToken`：Set BlendVision chatroom refreshToken.\
`host`：Set api host. Default is "https://api.one.blendvision.com".

```html
<yahoo-x-bv-player chatroomconfig='{"token":"your.BV.chatroom.token","refreshToken":"your.BV.chatroom.refreshToke","host":"https://api.one.blendvision.com"}'>
  ...
</yahoo-x-bv-player>
```

- **share**

Set share information.

`title`：Set share title.\
`text`：Set share descrioption.\
`url`：Set share url. Default is **link[rel=canonical]** or **current page url**.

```html
<yahoo-x-bv-player share='{"title":"Yahoo X BlendVision","text":"This is a Yahoo X BlendVision video player.","url":"https://your-domain/share.html"}'>
  ...
</yahoo-x-bv-player>
```

- **poster**

Set video poster.

```html
<yahoo-x-bv-player poster="https://your-domain/poster.jpg">
  ...
</yahoo-x-bv-player>
```

- **loop**

Set video loop or not.

```html
<yahoo-x-bv-player loop>
  ...
</yahoo-x-bv-player>
```

- **autopilot**

Set autopilot for like button or not.

```html
<yahoo-x-bv-player autopilot>
  ...
</yahoo-x-bv-player>
```

- **autoplay**

Set autoplay for video.

```html
<yahoo-x-bv-player autoplay>
  ...
</yahoo-x-bv-player>
```

- **host**

Set host information.

`avatar`：Set host avatar path.\
`name`：Set host name.\
`link`：Set host url.\
`count`：Set current count information.\
`announce`：Set content which host like to announce.\
`follow`：Set follow（Boolean） or not.

```html
<yahoo-x-bv-player host='{"avatar":"https://your-domain/host-avatar.png","name":"host name","link":"https://your-domain/host","count":"999","follow":false}'>
  ...
</yahoo-x-bv-player>
```

- **l10n**

Set localization for title or action buttons.

`previewtrigger`：Set preview trigger text content.\
`listingshead`：Set listing dialog's title.\
`buynow`：Set listing dialog's direct buy button text content.\
`jointhecrowd`：Set message when user joined LIVE.\
`rushbuying`：Set message when user visited product list or product page.\
`addfavorite`：Set message when user added host as his / her favorite.\
`sharelive`：Set message when user shared LIVE.\
`takesnapshot`：Set message when user took a snapshot.\
`achievetrophy`：Set message when user achieved like count trophy.

```html
<yahoo-x-bv-player l10n='{"previewtrigger":"View","listingshead":"Products","buynow":"BUY NOW","jointhecrowd":"joined the crowd.","rushbuying":"is rush buying.","addfavorite":"added host as favorite.","sharelive":"shared this LIVE.","takesnapshot":"took snapshot.","achievetrophy":"achieved {{hits}} likes."}'>
  ...
</yahoo-x-bv-player>
```

- **messagetemplate**

Set message template information. Default is `[]`.

```html
<yahoo-x-bv-player messagetemplate='["👍","+1","被燒🔥","尺寸？","材質？","多少錢？"]'>
  ...
</yahoo-x-bv-player>
```

- **products**

Set products' information.

`id`：Set product id.\
`uuid`：Set product uuid.\
`title`：Set product's title.\
`link`：Set product url.\
`thumbnail`：Set product thumbnail.\
`price`：Set product price.\
`marketPrice`：Set product market price（original price）. This key is optional.\
`priceRange`：Set product price range（min & max）in object format. UI will take this information first（hide price & marketPrice）. This key is optional.\
`bestDiscount`：Set product best discount. This is optional key.\
`marks`：Set product marks > **coupon**（Boolean）、**shipping coupon**（Boolean）、**buynow**（Boolean）. This is optional key..\
`buyCount`：Set product sold count.\
`broadcasting`：Set product is current broadcasting or not.（Boolean）.

```html
<yahoo-x-bv-player products='[{"id":"A1234567890","uuid":"334c6ea9-244e-4a6c-b320-d3506b4d6d91","title":"product title","link":"https://your-domain/product.html","thumbnail":"https://your-domain/img/product.jpg","price":"$ 9,999","bestDiscount":"-40%","marks":{"coupon":true,"shippingCoupon":false,"buynow":true},"buyCount":1,"broadcasting":true}]'>
  ...
</yahoo-x-bv-player>
```


## Properties

| Property Name | Type | Description |
| ----------- | ----------- | ----------- |
| type | String | Getter / Setter type as `live` or `replay`. |
| playerconfig | Object | Set BlendVision Web SDK config. Developers could set `licenseKey`、`title` and `source` here. |
| chatroomconfig | Object | Set BlendVision chatroom SDK config. Developers could set `token`、`refreshToken` and `host` here. |
| share | Object | Getter / Setter share information. Developers could set `title`、`text` and `url` here. |
| poster | String | Getter / Setter video poster. |
| loop | Boolean | Getter / Setter video loop. |
| autopilot | Boolean | Getter / Setter autopilot for like button. |
| currentTime | Number | Getter / Setter the current playback time in seconds. |
| muted | Boolean | Getter / Setter video is muted. |
| paused | Boolean | Getter video paused status. |
| host | Object | Getter / Setter host information. Developers could set `avatar`、`name`、`link`、`count`、`announce` and `follow` here. |
| l10n | Object | Getter / Setter localization for title or action buttons. Developers could set `previewtrigger`、`listingshead`、`buynow`、`jointhecrowd`、`rushbuying`、`addfavorite`、`sharelive`、`takesnapshot` and `achievetrophy` here. |
| messagetemplate | Array | Getter / Setter message template information. Default is `[]`. |
| products | Array | Getter / Setter products' information. Developers could set `id`、`uuid`、`title`、`link`、`thumbnail`、`price`、`marketPrice`、`priceRange`、`bestDiscount`、`marks`、`buyCount` and `broadcasting` here. |

## Mathods
| Mathod Signature | Description |
| ----------- | ----------- |
| play | Play video. |
| pause | Pause video. |

## Events
| Event Signature | Description |
| ----------- | ----------- |
| yahoo-x-bv-player-play | Fired when video play. |
| yahoo-x-bv-player-pause | Fired when video pause. |
| yahoo-x-bv-player-seeking | Fired when video seeking. |
| yahoo-x-bv-player-ended | Fired when video ended. |
| yahoo-x-bv-player-purchase-click | Fired when product's purchase button clicked. Developers could gather product information through event.detail. |
| yahoo-x-bv-player-follow-click | Fired when host's follow button clicked. Developers could gather follow information through event.detail. |
| yahoo-x-bv-player-live-ended | Fired when LIVE ended. |

## Reference
- [BlendVision Web SDK](https://www.blendvision.com/zh-tw)
- [BlendVision Chatroom SDK](https://www.npmjs.com/package/@blendvision/chatroom-javascript-sdk)
