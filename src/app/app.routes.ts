import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';

/**
 * Application Routes Configuration
 *
 * Best Practices:
 * - Lazy loading for better performance
 * - Standalone components (no NgModules)
 * - Route guards for protection
 * - Clear route structure with layout wrapper
 */
export const routes: Routes = [
  // ============================================
  // Public Routes (No Layout, No Auth Required)
  // ============================================
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },

  // Legal Pages (Public, No Auth Required)
  {
    path: 'terms',
    loadComponent: () =>
      import('./features/legal/terms/terms.component').then((m) => m.TermsComponent),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/legal/privacy/privacy.component').then((m) => m.PrivacyComponent),
  },

  // ============================================
  // Main Application Routes (With Layout)
  // ============================================
  {
    path: '',
    component: LayoutComponent,
    children: [
      // Home
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },

      // About
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/about.component').then((m) => m.AboutComponent),
      },

      // Products
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/components/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
      },

      // Cart
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/cart/components/cart.component').then((m) => m.CartComponent),
      },

      // Orders (Protected Route)
      {
        path: 'orders',
        canActivate: [authGuard], // 🔒 Protected by AuthGuard
        loadComponent: () =>
          import('./features/orders/components/orders.component').then((m) => m.OrdersComponent),
      },

      // User Profile (Protected Route)
      {
        path: 'users',
        canActivate: [authGuard], // 🔒 Protected by AuthGuard
        loadComponent: () =>
          import('./features/user/components/user-profile.component').then(
            (m) => m.UserProfileComponent,
          ),
      },

      // Fallback - Redirect to Home
      {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
      },
    ],
  },
];
