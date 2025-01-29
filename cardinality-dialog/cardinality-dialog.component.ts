import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-cardinality-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
  ],
  templateUrl: './cardinality-dialog.component.html',
  styleUrls: ['./cardinality-dialog.component.css'],
})
export class CardinalityDialogComponent {
  startCardinality: string = '';
  endCardinality: string = '';
  associationName: string = '';  // Nouveau champ pour l'association
  startCardinalityError: boolean = false;
  endCardinalityError: boolean = false;
  associationNameError: boolean = false;  // Erreur pour le nom de l'association

  constructor(
    public dialogRef: MatDialogRef<CardinalityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // Valider l'entrée de l'utilisateur
  validateInput(event: Event, field: 'startCardinality' | 'endCardinality' | 'associationName'): void {
    const inputValue = (event.target as HTMLInputElement).value;

    if (field === 'startCardinality') {
      this.startCardinality = inputValue;
      this.startCardinalityError = !['1', 'm', 'n'].includes(inputValue);
    } else if (field === 'endCardinality') {
      this.endCardinality = inputValue;
      this.endCardinalityError = !['1', 'm', 'n'].includes(inputValue);
    } else if (field === 'associationName') {
      this.associationName = inputValue;
      this.associationNameError = inputValue.trim() === '';  // Erreur si le nom est vide
    }
  }

  // Vérifier si le formulaire est valide
  isFormValid(): boolean {
    return (
      ['1', 'm', 'n'].includes(this.startCardinality) &&
      ['1', 'm', 'n'].includes(this.endCardinality) &&
      this.associationName.trim() !== ''  // Vérification que l'association a un nom
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.isFormValid()) {
      this.dialogRef.close({
        startCardinality: this.startCardinality,
        endCardinality: this.endCardinality,
        associationName: this.associationName,  // Ajouter l'association à la fermeture du dialog
      });
    }
  }
}