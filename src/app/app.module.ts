import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';


// App components
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
import { LeadsListComponent } from './components/leads-list/leads-list.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslocoRootModule } from '../transloco/transloco-root.module';
import { LanguageInterceptor } from './services/language-interceptor.service';

const MaterialModules = [
  MatButtonModule,
  
  MatProgressSpinnerModule,
  MatButtonToggleModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatCardModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatDialogModule,
  MatSnackBarModule,
  MatMenuModule,
  MatTabsModule,
  MatProgressSpinnerModule,
  MatChipsModule,
  MatBadgeModule,
  MatTooltipModule,
  MatAutocompleteModule,
  MatDividerModule,
  MatExpansionModule,
  MatStepperModule,
  MatSlideToggleModule
];

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
    LoadingIndicatorComponent,
    LeadsListComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    TranslocoRootModule,
    ...MaterialModules
  ],
  providers: [ {
    provide: HTTP_INTERCEPTORS,
    useClass: LanguageInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }