export const config = {
  matcher: '/:path*',
};

export default function middleware(request) {
  const host = request.headers.get('host') || '';

  if (host === 'admin.instantlivefootball.com.ng') {
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/admin-dashboard.html';
      return Response.redirect(url, 307);
    }
  }
}
