import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CompaniesComponent } from './components/companies/companies.component';
import { CompanyImportComponent } from './components/company-import/company-import.component';
import { LeadsComponent } from './components/leads/leads.component';
import { MeetingsComponent } from './components/meetings/meetings.component';
import { CompanyDetailComponent } from './components/company-detail/company-detail.component';
import { LeadDetailComponent } from './components/lead-detail/lead-detail.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { TasksDetailComponent } from './components/tasks-detail/tasks-detail.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'companies', component: CompaniesComponent },
  { path: 'companies/import', component: CompanyImportComponent },
  { path: 'companies/:id', component: CompanyDetailComponent },
  { path: 'leads', component: LeadsComponent },
  { path: 'leads/new', component: LeadDetailComponent }, // New lead creation
  { path: 'leads/:id', component: LeadDetailComponent }, // Edit existing lead
  { path: 'meetings', component: MeetingsComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'tasks/new', component: TasksDetailComponent }, // New task creation
  { path: 'tasks/:id', component: TasksDetailComponent }, // Edit existing task
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }