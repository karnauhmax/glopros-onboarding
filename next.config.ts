import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  // `/onboarding` has no page of its own. The entry route decides which step to open.
  redirects: () => [{ source: '/onboarding', destination: '/', permanent: false }],
};

export default nextConfig;
