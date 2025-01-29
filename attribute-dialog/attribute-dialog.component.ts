import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';

// Définition de l'interface FormData
interface FormData {
  id: boolean; // Indique si c'est une clé primaire
  logicalName: string | null;
  type: string | null;
  getter: boolean; // Indique si un getter est nécessaire
  setter: boolean; // Indique si un setter est nécessaire
}

@Component({
  selector: 'app-attribute-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
  ],
  templateUrl: './attribute-dialog.component.html',
  styleUrls: ['./attribute-dialog.component.css'],
})
export class AttributeDialogComponent {
  // Initialisation de l'objet formData avec des valeurs par défaut
  formData: FormData = {
    id: false, // Par défaut, l'attribut n'est pas une clé primaire
    logicalName: null, // Par défaut, aucun nom logique n'est défini
    type: null, // Par défaut, aucun type n'est sélectionné
    getter: false, // Par défaut, pas de getter
    setter: false, // Par défaut, pas de setter
  };

  // Injection de MatDialogRef pour gérer la fermeture de la boîte de dialogue
  constructor(public dialogRef: MatDialogRef<AttributeDialogComponent>) {}

  // Méthode appelée lors de la soumission du formulaire
  onSubmit(): void {
    const newRow = { ...this.formData }; // Crée une copie de l'objet formData
    this.dialogRef.close(newRow); // Ferme la boîte de dialogue et renvoie les données
  }

  // Méthode appelée lors de l'annulation
  onCancel(): void {
    this.dialogRef.close(null); // Ferme la boîte de dialogue sans renvoyer de données
  }
}