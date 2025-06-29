import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslocoRootModule } from '../../../transloco/transloco-root.module';

@NgModule({
    imports: [TranslocoRootModule, CommonModule, FormsModule, ReactiveFormsModule],
    exports: [TranslocoRootModule, CommonModule, FormsModule, ReactiveFormsModule]
})

export class SharedModule { }