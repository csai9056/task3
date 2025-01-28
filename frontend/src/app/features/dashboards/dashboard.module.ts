import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FileuploadComponent } from './components/fileupload/fileupload.component';
import { DashboardRoutingModule } from './dashboard.routing.module';
import { MainpageComponent } from './components/mainpage/mainpage.component';
import { ProductformComponent } from './components/productform/productform.component';
import { DashboardService } from './components/dashboard.service';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from 'src/app/filter.pipe';
import { writeXLSX } from 'xlsx';
import { MovetocardComponent } from './components/movetocard/movetocard.component';
@NgModule({
  declarations: [
    NavbarComponent,
    DashboardComponent,
    FileuploadComponent,
    MainpageComponent,
    ProductformComponent,
    FilterPipe,
    MovetocardComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    FormsModule,
  ],
  // providers: [DashboardService],
})
export class DashBoardModule {}
