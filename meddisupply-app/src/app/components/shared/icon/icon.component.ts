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
        s = this.postProcessSvg(s);
        this.svg = s;
        return;
      }
    } catch (e) {
      // continue to fallback
    }

    // fallback: attempt to fetch local SVG and inline its content so it inherits color
    try {
      const resp = await fetch(`/assets/icons/${this.name}.svg`);
      if (resp.ok) {
        let text = await resp.text();
        text = this.postProcessSvg(text);
        this.svg = text;
        return;
      }
    } catch (e) {
      // ignore
    }

    // final fallback: simple inline placeholder
    this.svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" stroke="currentColor"><circle cx="${Math.floor(size/2)}" cy="${Math.floor(size/2)}" r="${Math.floor(size/3)}"/></svg>`;
  }

  private postProcessSvg(s: string) {
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
    return s;
  }

  private toPascal(name: string) {
    return name.replace(/(^|[-_])(\w)/g, (_m: string, _p1: string, p2: string) => p2.toUpperCase());
  }
}
