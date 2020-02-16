import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Span1Component } from './components/span1/span1.component';




const routes: Routes = [
    { path: '', redirectTo: '/span1', pathMatch: 'full' },
    { path: 'span1', component: Span1Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false,
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {


}
