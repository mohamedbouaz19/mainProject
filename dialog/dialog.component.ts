import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AttributeDialogComponent } from '../attribute-dialog/attribute-dialog.component';

interface TableRow {
  id: boolean;
  conceptualName: string | null;
  logicalName: string | null;
  type: string | null;
  getter: boolean;
  setter: boolean;
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatTableModule,
  ],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent {
  className: string = '';
  tableData = new MatTableDataSource<TableRow>([]);
  displayedColumns: string[] = ['id', 'conceptualName', 'logicalName', 'type', 'actions'];

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {}

  /**
   * Ajoute une nouvelle ligne à la table en ouvrant le dialogue d'attribut.
   */
  addRow(): void {
    const dialogRef = this.dialog.open(AttributeDialogComponent, {
      width: '400px', // Réduction de la largeur
      height: 'auto', // Hauteur adaptée au contenu
      panelClass: 'custom-dialog', // Classe personnalisée (si besoin)
    });
  
    dialogRef.afterClosed().subscribe((result: TableRow | null) => {
      if (result) {
        const newRow = { ...result, conceptualName: this.className };
        this.tableData.data = [...this.tableData.data, newRow];
      }
    });
  }
  
  editRow(row: TableRow): void {
    const dialogRef = this.dialog.open(AttributeDialogComponent, {
      width: '400px', // Réduction de la largeur
      height: 'auto', // Hauteur adaptée au contenu
      panelClass: 'custom-dialog', // Classe personnalisée (si besoin)
      data: { ...row },
    });
  
    dialogRef.afterClosed().subscribe((result: TableRow | null) => {
      if (result) {
        const index = this.tableData.data.findIndex((item) => item.logicalName === row.logicalName);
        if (index !== -1) {
          const updatedData = [...this.tableData.data];
          updatedData[index] = result;
          this.tableData.data = updatedData;
        }
      }
    });
  }
  

  /**
   * Supprime une ligne de la table.
   * @param row La ligne à supprimer.
   */
  deleteRow(row: TableRow): void {
    this.tableData.data = this.tableData.data.filter((item) => item.logicalName !== row.logicalName);
  }

  /**
   * Ferme le dialogue et retourne les données (nom de la classe et données de la table).
   */
  closeDialogWithData(): void {
    this.dialogRef.close({
      className: this.className,
      tableData: this.tableData.data,
    });
  }
}
