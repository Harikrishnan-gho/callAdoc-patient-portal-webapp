import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-custom-dialog',
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule],
  templateUrl: './custom-dialog.html',
  styleUrl: './custom-dialog.css',
})
export class CustomDialog {
  @Input() show = false;

  // Text props
  @Input() heading = '';
  @Input() subheading = '';

  // Button labels
  @Input() primaryBtnText = 'Confirm';
  @Input() secondaryBtnText = 'Cancel';
  @Input() hideActions = false;
  // Events
  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onPrimaryClick() {
    this.primaryAction.emit();
  }

  onSecondaryClick() {
    this.secondaryAction.emit();
  }

  onClose() {
    this.close.emit();
  }
}
