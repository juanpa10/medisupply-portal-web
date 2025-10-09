import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as lucide from 'lucide';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  template: `
    <span [innerHTML]="svg | safeHtml"></span>
  `
})
export class IconComponent implements OnChanges {
  @Input() name = '';
  @Input() size: number | string = 20;
  svg = '';

  ngOnChanges(changes: SimpleChanges): void {
    // kick off async render; result will update `svg` when available
    this.render();
  }

  private async render() {
    const size = typeof this.size === 'string' ? parseInt(this.size, 10) || 20 : this.size;
    // try lucide first
    try {
      const icon = (lucide as any)[this.toPascal(this.name)];
      if (icon) {
  let s: string = icon({ width: size, height: size });
  s = this.postProcessSvg(s, size);
        this.svg = s;
        console.debug('app-icon: rendered lucide', { name: this.name, length: s.length });
        return;
      }
    } catch (e) {
      // continue to fallback
    }

    // fallback: attempt to fetch local SVG and inline its content so it inherits color
    try {
      // Clear while we load so templates don't show stale icons during slow fetches
      this.svg = '';
      const paths = [`/assets/icons/${this.name}.svg`, `assets/icons/${this.name}.svg`];
      for (const p of paths) {
        try {
          const resp = await fetch(p);
          if (resp.ok) {
            let text = await resp.text();
            text = this.postProcessSvg(text, size);
            this.svg = text;
            console.debug('app-icon: fetched local svg', { name: this.name, path: p, length: text.length });
            return;
          } else {
            // non-ok status, continue to next path
            console.warn(`app-icon: fetch ${p} returned ${resp.status}`);
          }
        } catch (err) {
          // record the specific fetch error and try the next path
          console.warn(`app-icon: error fetching ${p}:`, err);
        }
      }
    } catch (e) {
      console.warn('app-icon: unexpected error during local fallback', e);
    }

    // final fallback: simple inline placeholder
    const placeholder = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" stroke="currentColor"><circle cx="${Math.floor(size/2)}" cy="${Math.floor(size/2)}" r="${Math.floor(size/3)}"/></svg>`;
    this.svg = placeholder;
    console.debug('app-icon: using placeholder', { name: this.name, length: placeholder.length });
  }

  private postProcessSvg(s: string, size: number) {
    // normalize stroke to currentColor
    s = s.replace(/stroke="#[^"]+"/g, 'stroke="currentColor"');
    s = s.replace(/stroke="none"/g, 'stroke="currentColor"');
    // if stroke attribute is missing but path elements use stroke-width, set stroke to currentColor
    s = s.replace(/(<(path|circle|rect|line|polyline|polygon)[^>]*)(>)/g, (m, p1, p2, p3) => {
      if (/stroke=/.test(p1)) return m;
      return p1 + ' stroke="currentColor"' + p3;
    });
    // replace fills that are not none to currentColor to allow filled icons to inherit
    s = s.replace(/fill="(?!none)[^"]+"/g, 'fill="currentColor"');
    // If an element has a stroke but no explicit fill, ensure it's not filled (prevents solid blocks)
    s = s.replace(/<(path|rect|circle|line|polyline|polygon)([^>]*)>/g, (m: string, tag: string, attrs: string) => {
      const hasStroke = /\bstroke=/.test(attrs);
      const hasFill = /\bfill=/.test(attrs);
      if (hasStroke && !hasFill) {
        return `<${tag}${attrs} fill="none">`;
      }
      return m;
    });
    // Ensure root <svg> has explicit width/height and inline display so it shows and
    // inherits color correctly when inlined via innerHTML.
    s = s.replace(/<svg([^>]*)>/, (m, attrs) => {
      let a = attrs || '';
      // add or replace width attribute
      if (!/\bwidth=/.test(a)) a += ` width="${size}"`;
      else a = a.replace(/width="[^"]+"/, `width="${size}"`);
      // add or replace height attribute
      if (!/\bheight=/.test(a)) a += ` height="${size}"`;
      else a = a.replace(/height="[^"]+"/, `height="${size}"`);
      // ensure inline display and vertical-align via style attribute
      if (/\bstyle="([^"]*)"/.test(a)) {
        a = a.replace(/style="([^"]*)"/, (_m2: string, styleVal: string) => {
          const styles = styleVal.split(';').map((s: string) => s.trim()).filter(Boolean);
          const map: Record<string,string> = {};
          styles.forEach((s: string) => { const [k,v] = s.split(':').map((x: string) => x.trim()); if (k) map[k]=v; });
          map['display'] = map['display'] || 'inline-block';
          map['vertical-align'] = map['vertical-align'] || 'middle';
          const newStyle = Object.entries(map).map(([k,v]) => `${k}: ${v}`).join('; ');
          return `style="${newStyle}"`;
        });
      } else {
        a += ` style="display: inline-block; vertical-align: middle;"`;
      }
      if (!/\bfocusable=/.test(a)) a += ' focusable="false"';
      if (!/\baria-hidden=/.test(a) && !/\brole=/.test(a)) a += ' aria-hidden="true"';
      return `<svg${a}>`;
    });

    return s;
  }

  private toPascal(name: string) {
    return name.replace(/(^|[-_])(\w)/g, (_m: string, _p1: string, p2: string) => p2.toUpperCase());
  }
}
