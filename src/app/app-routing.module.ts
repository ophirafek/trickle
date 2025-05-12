import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CompaniesComponent } from './components/companies/companies.component';
import { CompanyImportComponent } from './components/company-import/company-import.component';
import { LeadsComponent } from './components/leads/leads.component';
import { MeetingsComponent } from './components/meetings/meetings.component';
import { CompanyDetailComponent } from './components/company-detail/company-detail.component';
import { CompanyListComponent } from './components/company-list/company-list.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'companies', component: CompanyListComponent },
  { path: 'companies/import', component: CompanyImportComponent },
  { path: 'companies/:id', component: CompanyDetailComponent },
  { path: 'leads', component: LeadsComponent },
  { path: 'meetings', component: MeetingsComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }