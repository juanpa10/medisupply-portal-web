import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      const raw = localStorage.getItem('meddisupply_auth');
      if (raw) {
        const auth = JSON.parse(raw) as any;
        const token = auth?.access_token || auth?.token;
        console.debug('AuthInterceptor: found auth in localStorage:', !!auth, 'token present:', !!token);
        if (token) {
          console.debug('AuthInterceptor: attaching Authorization header for', req.url);
          const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
          return next.handle(cloned);
        }
      }
    } catch (e) {
      // if parsing fails, continue without token
      console.warn('AuthInterceptor: failed to read token from localStorage', e);
    }
    return next.handle(req);
  }
}
