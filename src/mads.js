/* global document window XMLHttpRequest MutationObserver mraid */
import constants from './constants';

export default class Mads {
  constructor() {
    this.body = document.getElementsByTagName('body')[0];
    this.head = document.getElementsByTagName('head')[0];

    this.googleApiKey = 'AIzaSyCFHn5MNIYN-lGyTDTUYRAJM2fEKvHm-nE';

    this.path = typeof window.rma !== 'undefined' ? window.rma.customize.src || '' : '';

    // Get JSON value
    if (!constants.json && window.rma && window.rma.customize && window.rma.customize.json && Object.keys(window.rma.customize.json).length !== 0) {
      this.json = window.rma.customize.json;
    } else if (constants.json && Object.keys(constants.json).length !== 0) {
      this.json = constants.json;
    } else {
      this.json = this.resolve('./data.json');
    }

    // Setup & get FET value
    this.fetTracked = false;
    if (!constants.fet && window.rma) {
      this.fet =  typeof window.rma.fet === 'string' ? [window.rma.fet] : window.rma.fet;
    } else if (constants.fet) {
      this.fet = typeof constants.fet === 'string' ? [constants.fet] : constants.fet;
    } else {
      this.fet = [];
    }

    if (!constants.custTracker && window.rma) {
      this.custTracker = window.rma.customize.custTracker;
    } else if (constants.custTracker) {
      this.custTracker = constants.custTracker;
    } else {
      this.custTracker = [];
    }

    if (!constants.ct && window.rma) {
      this.ct = typeof window.rma.ct === 'string' ? [window.rma.ct] : window.rma.ct;
    } else if (constants.ct) {
      this.ct = typeof constants.ct === 'string' ? [constants.ct] : constants.ct;
    } else {
      this.ct = [];
    }

    if (!constants.cte && window.rma) {
      this.cte = typeof window.rma.cte === 'string' ? [window.rma.cte] : window.rma.cte;
    } else if (constants.cte) {
      this.cte = typeof constants.cte === 'string' ? [constants.cte] : constants.cte;
    } else {
      this.cte = [];
    }

    if (constants.pgId && typeof constants.pgId !== 'undefined' && constants.pgId !== 'undefined') {
      this.pgId = constants.pgId
    } else {
      const genereatePgId = (flag) => {
        const r = (Math.random().toString(16) + "000000000").substr(2, 8);
        return flag ? `-${r.substr(0, 4)}-${r.substr(4,4)}` : r;
      }

      this.pgId = `${genereatePgId()}${genereatePgId(true)}${genereatePgId(true)}${genereatePgId()}`;
    }

    if (!constants.tags && window.rma) {
      this.leadTags = this.leadTagsProcess(window.rma.tags);
      this.tags = this.processTags(window.rma.tags);
    } else if (constants.tags) {
      this.leadTags = this.leadTagsProcess(constants.tags);
      this.tags = this.processTags(constants.tags);
    } else {
      this.leadTags = '';
      this.tags = '';
    }

    this.id = this.generateUniqueId();
    this.tracked = [];
    this.trackedEngagementType = [];
    this.engagementTypeExclude = [];
    this.firstEngagementTracked = false;
    this.content = document.getElementById('rma-widget');

    for (let i = 0; i < this.custTracker.length; i += 1) {
      if (this.custTracker[i].indexOf('{2}') !== -1) {
        this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
      }
    }
    this.elems = {};

    const loadAdOldSchool = () => {
      if (typeof this.json === 'string' && (this.json.indexOf('./') === 0 || this.json.indexOf('https://') === 0 || this.json.indexOf('http://') === 0)) {

        this.loadJS(this.json).then(() => {
          if (json_data) {
            this.userId = json_data.userId;
            this.studioId = json_data.id;
            this.data = json_data;
            this.leadData = {
              leadGenEle: json_data.leadGenEle,
            };
          }
          console.log('loaded old with loading json', this.json, this.data);
          this.loadAd();
        });
      } else {
        if (constants.json) {
          this.userId = constants.json.userId;
          this.studioId = constants.json.id;
          this.data = constants.json;
          this.leadData = {
            leadGenEle: constants.json.leadGenEle,
          };
        }
        console.log('loaded old with constant json', constants.json, this.data);
        this.loadAd();
      }
    }

    // if (constants.preview) {
    //   window.addEventListener('message', (e) => {
    //     const props = e.data.data;
    //     if (typeof e.data.auth !== 'undefined' && e.data.auth === 'preview') {
    //       this.data = props.data;
    //       this.leadData = props.leadgen;
    //       this.userId = props.userId
    //       this.studioId = props.studioId;
    //       setTimeout(() => {
    //         console.log('loaded new with preview json', props, this.data);
    //         this.loadAd();
    //       }, 1);
    //     }
    //   });
    // } 
    if (constants.md5 && constants.md5 !== 'undefined' && typeof constants.md5 !== 'undefined') {
      this.loadJS(`https://cdn.richmediaads.com/studio-full/${constants.md5}.json?pgId${this.pgId}`).then(() => {
        try {
          this.userId = data_studiofull.userId;
          this.studioId = data_studiofull.id;
          this.data = data_studiofull.tab1.componentContent[34].data.raw.property;
          this.leadData = data_studiofull.tab1.componentContent[34].data.raw.leadgen;
          console.log('loaded new with md5 json', data_studiofull, this.data);
          this.loadAd();
        } catch (e) {
          loadAdOldSchool();
        }
      });
    } else {
      loadAdOldSchool();
    }
  }

  loadAd() {
    const obs = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target === this.content) {
          this.content.querySelectorAll('*').forEach((elem) => {
            if (elem.id) {
              this.elems[elem.id] = elem;
            }
          });
          if (this.postRender) this.postRender();
          this.events();
          obs.disconnect();
        }
      });
    });

    const config = { childList: true };

    obs.observe(this.content, config);

    this.content.innerHTML = this.render().replace(/src="/g, `src="${this.path}`);

    const defaultStyles = 'body{padding:0;margin:0;}';
    this.loadCSS(defaultStyles);
    const style = this.style();
    if (typeof style === 'string') {
      this.loadCSS(style);
    } else {
      style.forEach(_style => this.loadCSS(_style));
    }
  }

  resolve(path) {
    if (this.path) {
      return this.path + path;
    }
    return path;
  }

  generateUniqueId() { // eslint-disable-line class-methods-use-this
    return +new Date();
  }

  processTags(tags) {
    const tmpTags = tags || this.tags;
    let resultTags = '';
    Object.keys(tmpTags).forEach((tag) => {
      if (tmpTags[tag]) {
        tmpTags[tag] = encodeURIComponent(tmpTags[tag]);
        resultTags += `&${tag}=${tmpTags[tag]}`;
      }
    });

    return resultTags;
  }

  leadTagsProcess(tags) {
    let tmpTags = '';
    Object.keys(tags).forEach((tag) => {
      if (tags[tag]) {
        tmpTags += tags[tag] + ',';
      }
    });
    return tmpTags.slice(0, -1);
  }

  linkOpener(url) {
    let tmpUrl = url;
    if (typeof tmpUrl !== 'undefined' && tmpUrl !== '') {
      if (typeof this.ct !== 'undefined' && this.ct !== '' && this.ct.length !== 0) {
        tmpUrl = this.ct + encodeURIComponent(tmpUrl);
        this.url = tmpUrl;
      }

      if (typeof mraid !== 'undefined') {
        mraid.open(tmpUrl);
      } else {
        window.open(tmpUrl);
      }

      if (typeof this.cte !== 'undefined' && this.cte !== '') {
        this.imageTracker(this.cte);
      }
    }
  }

  tracker(tt, type, name, value) {
    const tmpName = type.name || (name || type);
    let tmpValue = value;

    if (tt === 'E' && !this.fetTracked && this.fet) {
      for (let i = 0; i < this.fet.length; i += 1) {
        const t = document.createElement('img');
        t.src = decodeURIComponent(this.fet[i]);

        t.style.display = 'none';
        this.body.appendChild(t);
      }
      this.fetTracked = true;
    }

    if (typeof this.custTracker !== 'undefined' && this.custTracker !== '' && this.tracked.indexOf(tmpName) === -1) {
      for (let i = 0; i < this.custTracker.length; i += 1) {
        if (i !== 0 && type.exclude) continue;
        const img = document.createElement('img');

        if (typeof tmpValue === 'undefined') {
          tmpValue = '';
        }

        let src = this.custTracker[i].replace('{{rmatype}}', type.name || type);
        src = src.replace('{{rmavalue}}', tmpValue);

        if (this.trackedEngagementType.indexOf(tt) !== -1
          || this.engagementTypeExclude.indexOf(tt) !== -1) {
          src = src.replace('tt={{rmatt}}', '');
        } else {
          src = src.replace('{{rmatt}}', tt);
          this.trackedEngagementType.push(tt);
        }

        if (!this.firstEngagementTracked && tt === 'E' && type !== 'tilt_landscape') {
          src += '&ty=E';
          this.firstEngagementTracked = true;
        }

        if (type == 'yt_play') {
          src += '&tv=VP'
        } else if (type == 'yt_play_100') {
          src += '&tv=VC'
        }

        const tags = Object.keys(this.tags).map((key) => {
          return this.tags[key]
        })

        img.src = `${src + this.tags}&${this.id}`;

        img.style.display = 'none';
        this.body.appendChild(img);

        this.tracked.push(tmpName);
      }
    }
  }

  imageTracker(url) {
    for (let i = 0; i < url.length; i += 1) {
      const t = document.createElement('img');
      t.src = url[i];

      t.style.display = 'none';
      this.body.appendChild(t);
    }
  }

  loadJS(url) {
    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement('script');
        script.src = url;
        this.head.appendChild(script);
        script.onload = () => {
          resolve(true);
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  generateShortUrl(url) {
    return new Promise((resolve, reject) => {
      if (this.shortUrl) {
        resolve(JSON.stringify({ id: this.shortUrl }));
      } else {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `https://www.googleapis.com/urlshortener/v1/url?key=${this.googleApiKey}`);
          xhr.setRequestHeader('content-type', 'application/json');
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
              resolve(xhr.responseText);
            }
          };
          xhr.send(JSON.stringify({ longUrl: url }));
        } catch (e) {
          reject(e);
        }
      }
    });
  }

  loadCSS(url) {
    return new Promise((resolve, reject) => {
      try {
        if (url.indexOf('http') === 0) {
          const link = document.createElement('link');
          link.href = url;
          link.setAttribute('type', 'text/css');
          link.setAttribute('rel', 'stylesheet');
          this.head.appendChild(link);
        } else {
          const cssText = url.replace(/(<br>)|(\n)|(      )/gm, '');
          const style = document.createElement('style');
          style.innerText = cssText;
          this.head.appendChild(style);
        }

        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }
}
