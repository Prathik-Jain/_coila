import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { PnrComponent } from './pnr/pnr.component';
import { TrainRouteComponent } from './train-route/train-route.component';
import { NavigationComponent } from './navigation/navigation.component';
import { SeatAvailabilityComponent } from './seat-availability/seat-availability.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { HttpModule } from '@angular/http';
import { AgmCoreModule } from '@agm/core';
import { LiveTrainStatusComponent } from './live-train-status/live-train-status.component';
import { PhoneAuthComponent } from './phone-auth/phone-auth.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
// Services
import { PnrService } from './pnr.service';
import { TrainRouteService } from './train-route.service';
import { SeatAvailabilityService } from './seat-availability.service';
import { WindowService } from './window.service';
import { LtsService } from './lts.service';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    PnrComponent,
    TrainRouteComponent,
    NavigationComponent,
    SeatAvailabilityComponent,
    PhoneAuthComponent,
    LiveTrainStatusComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    HttpModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AgmCoreModule.forRoot({
    apiKey: '', //Google Maps API KEY
    })
  ],
  providers: [
    PnrService,
    TrainRouteService,
    SeatAvailabilityService,
    WindowService,
    LtsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
