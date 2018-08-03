import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PnrComponent } from './pnr/pnr.component';
import { SeatAvailabilityComponent } from './seat-availability/seat-availability.component';
import { TrainRouteComponent } from './train-route/train-route.component';
import { LiveTrainStatusComponent } from './live-train-status/live-train-status.component';

const routes: Routes = [
  { path: '', component: PnrComponent, },
  { path: 'pnr/:pnr', component: PnrComponent },
  { path: 'pnr', component: PnrComponent },
  { path: 'pnr-status/:pnr', component: PnrComponent },
  { path: 'pnr-status', component: PnrComponent },
  { path: 'live-train-status', component: LiveTrainStatusComponent },
  { path: 'live-train-status/:train/:date', component: LiveTrainStatusComponent },
  { path: 'seat-availability', component: SeatAvailabilityComponent },
  { path: 'seat-availability/:src/:dest/:date/:pref_class/:pref_quota', component: SeatAvailabilityComponent },
  { path: 'seat-availability/:src/:dest/:date', component: SeatAvailabilityComponent },
  { path: 'train-route', component: TrainRouteComponent },
  { path: 'train-route/:train', component: TrainRouteComponent },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
