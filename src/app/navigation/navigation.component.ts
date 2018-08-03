import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})

export class NavigationComponent implements OnInit {

  items = ['PNR STATUS',
    'LIVE TRAIN STATUS',
    'SEAT AVAILABILITY',
    'TRAIN ROUTE'];

  constructor() { }

  ngOnInit() { }

}
