import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'companies',
    loadComponent: () => import('./components/companies/companies.component').then(m => m.CompaniesComponent)
  },
  {
    path: 'companies/import',
    loadComponent: () => import('./components/company-import/company-import.component').then(m => m.CompanyImportComponent)
  },
  {
    path: 'companies/:id',
    loadComponent: () => import('./components/company-detail/company-detail.component').then(m => m.CompanyDetailComponent)
  },
  {
    path: 'leads',
    loadComponent: () => import('./components/leads/leads.component').then(m => m.LeadsComponent)
  },
  {
    path: 'leads/new',
    loadComponent: () => import('./components/lead-detail/lead-detail.component').then(m => m.LeadDetailComponent)
  },
  {
    path: 'leads/:id',
    loadComponent: () => import('./components/lead-detail/lead-detail.component').then(m => m.LeadDetailComponent)
  },
  {
    path: 'meetings',
    loadComponent: () => import('./components/meetings/meetings.component').then(m => m.MeetingsComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/tasks/tasks.component').then(m => m.TasksComponent)
  },
  {
    path: 'tasks/new',
    loadComponent: () => import('./components/tasks-detail/tasks-detail.component').then(m => m.TasksDetailComponent)
  },
  {
    path: 'tasks/:id',
    loadComponent: () => import('./components/tasks-detail/tasks-detail.component').then(m => m.TasksDetailComponent)
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];
