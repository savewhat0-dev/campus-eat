# Dependency update

The standalone Render package now installs only React, React DOM, Lucide icons, PostgreSQL driver, and the build/test tools it actually uses. Unused Next.js, Vinext, Cloudflare deployment tools and component-library dependencies have been removed from this independent deployment package.

npm audit fix completed with 0 reported vulnerabilities on this dependency tree. This is an advisory scan result, not a guarantee that no security defects exist. The source package used for the separate existing ChatGPT hosting was not replaced by this standalone configuration.

Validation: embedded PostgreSQL authentication/order lifecycle, Chef food search, Render URL configuration, and standalone production build. Real hosted PostgreSQL networking and actual OTP delivery remain dependent on your Render/Resend secrets and require verification after deployment.

See REPLACE-OLD-SERVER.md first if your logs mention DATABASE_PATH or /var/data. This package runs PostgreSQL and prints postgres-v2 on startup.
