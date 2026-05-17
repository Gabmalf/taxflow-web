import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userStr = localStorage.getItem('taxflow_user');
  let token = '';

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      token = user.token || '';
    } catch (e) {
      console.error('Error parsing user data', e);
    }
  }

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
};
