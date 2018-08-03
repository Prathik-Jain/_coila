import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, } from '@angular/material';

@NgModule({
  imports: [MatInputModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule
  ],
  exports: [MatInputModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule]
})
export class MaterialModule { }
