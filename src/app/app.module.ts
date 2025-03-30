import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withJsonpSupport } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CompanyCardComponent } from './components/company-card/company-card.component';
import { HeaderComponent } from './components/header/header.component';
import { CompaniesComponent } from './components/companies/companies.component';
import { LeadsComponent } from './components/leads/leads.component';
import { MeetingsComponent } from './components/meetings/meetings.component';
import { MeetingDetailComponent } from './components/meeting-detail/meeting-detail.component';
import { CompanyDetailComponent } from './components/company-detail/company-detail.component';
import { CompanyImportComponent } from './components/company-import/company-import.component';
import { LeadDetailComponent } from './components/lead-detail/lead-detail.component';
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    CompanyCardComponent,
    HeaderComponent,
    CompaniesComponent,
    LeadsComponent,
    MeetingsComponent,
    MeetingDetailComponent,
    CompanyDetailComponent,
    CompanyImportComponent,
    LeadDetailComponent,
    LoadingIndicatorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule
  ],
  providers: [
    provideHttpClient(withJsonpSupport())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }