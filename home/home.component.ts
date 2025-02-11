import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import Konva from 'konva';
import { DialogComponent } from '../dialog/dialog.component';
import { CardinalityDialogComponent } from '../cardinality-dialog/cardinality-dialog.component';
import { ClassService } from 'src/app/class.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    DragDropModule,
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('stageContainer', { static: true }) stageContainer!: ElementRef;
  private stage!: Konva.Stage;
  private layer!: Konva.Layer;
  private tool: string = ''; // Outil initial vide
  private currentGroup: Konva.Group | null = null;
  private isDrawingLine: boolean = false;
  private lineStartRect: Konva.Group | null = null;
  private lines: Konva.Line[] = []; // Tableau pour stocker les lignes
  private shapes: Konva.Group[] = []; // Tableau pour stocker les groupes de formes

  constructor(private dialog: MatDialog,private classService: ClassService) {}

  ngOnInit(): void {
    const containerElement = this.stageContainer.nativeElement;

    // Initialisation de la scène Konva
    this.stage = new Konva.Stage({
      container: containerElement,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Événements
    this.stage.on('mousedown', (e) => this.startDrawing(e));
    this.stage.on('mouseup', () => this.stopDrawing());
    this.stage.on('dblclick', (e) => this.handleDoubleClick(e)); // Double-clic pour les classes
  }

  ngAfterViewInit(): void {
    window.addEventListener('resize', () => this.resizeStage());
  }

  resizeStage(): void {
    const containerElement = this.stageContainer.nativeElement;
    this.stage.width(containerElement.offsetWidth);
    this.stage.height(containerElement.offsetHeight);
    this.layer.draw();
  }

  setTool(tool: string): void {
    this.tool = tool;
    this.isDrawingLine = tool === 'line';
  }

  startDrawing(event: any): void {
    const pos = this.stage.getPointerPosition();
    if (!pos) return;
  
    if (this.tool === 'rectangle') {
      // Créer un groupe pour le rectangle, le texte et la ligne
      const group = new Konva.Group({
        x: pos.x,
        y: pos.y,
        draggable: true,
      });
  
      // Créer un texte pour le nom de la classe
      const classNameText = new Konva.Text({
        text: 'Classname',
        fontSize: 14,
        fontFamily: 'Arial',
        fill: 'black',
        padding: 5,
        align: 'center',
        x: 5,
        y: 5,
        wrap: 'none',
      });
  
      // Calculer la largeur du texte
      const textWidth = classNameText.width();
  
      // Créer un rectangle avec une largeur basée sur la largeur du texte
      const rect = new Konva.Rect({
        width: textWidth + 20,
        height: 100,
        fill: '#FBF5DD',
        stroke: 'black',
        strokeWidth: 2,
      });
  
      // Créer une ligne horizontale pour séparer le nom de la classe des attributs
      const separatorLine = new Konva.Line({
        points: [0, 40, rect.width(), 40],
        stroke: 'black',
        strokeWidth: 1,
      });
  
      // Créer un texte pour les attributs et méthodes
      const attributesText = new Konva.Text({
        text: '+ field: type\n+ field: type\n+ field: type',
        fontSize: 12,
        fontFamily: 'Arial',
        fill: 'black',
        padding: 5,
        align: 'left',
        x: 5,
        y: 45,
        lineHeight: 1.5,
        name: 'attributesText',
        wrap: 'none',
      });
  
      // Ajouter le rectangle, le texte et la ligne au groupe
      group.add(rect);
      group.add(classNameText);
      group.add(separatorLine);
      group.add(attributesText);
  
      // Ajuster la hauteur du rectangle en fonction du texte
      const totalHeight = classNameText.height() + separatorLine.height() + attributesText.height() + 10;
      if (totalHeight > rect.height() - 10) {
        rect.height(totalHeight + 10);
        
      }
  
      // Ajouter le groupe à la couche
      this.layer.add(group);
      this.shapes.push(group); // Ajouter le groupe au tableau des formes
      this.layer.draw();
  
      // Conserver la référence pour le dessin actuel
      this.currentGroup = group;
  
      // Écouter l'événement de déplacement pour mettre à jour les lignes
      group.on('dragmove', () => this.updateConnectedLines(group));
    } else if (this.tool === 'line' && this.isDrawingLine) {
      const clickedShape = event.target.findAncestor('Group');
      if (clickedShape && clickedShape.findOne('Rect')) {
        if (!this.lineStartRect) {
          this.lineStartRect = clickedShape;
        } else {
          // Vérifier si une ligne existe déjà entre les deux classes
          const lineExists = this.lines.some((line) => {
            const startShape = line.getAttr('startShape');
            const endShape = line.getAttr('endShape');
            return (
              (startShape === this.lineStartRect && endShape === clickedShape) ||
              (startShape === clickedShape && endShape === this.lineStartRect)
            );
          });
  
          if (!lineExists) {
            this.drawLineBetweenShapes(this.lineStartRect, clickedShape);
          } else {
            console.log('Une ligne existe déjà entre ces deux classes.');
          }
  
          this.lineStartRect = null;
        }
      }
    }
  }

  stopDrawing(): void {
    this.currentGroup = null;
  }
  saveClasses(): void {
    this.shapes.forEach((shape) => {
      const classNameText = shape.findOne((node) => node.getClassName() === 'Text') as Konva.Text;
      const attributesText = shape.findOne((node) => node.name() === 'attributesText') as Konva.Text;
  
      const className = classNameText?.text().trim() || 'Unnamed Class';
      
      const attributes = attributesText?.text().split('\n').map(attr => {
        const parts = attr.replace('+ ', '').split(':').map(s => s.trim());
        return (parts.length === 2 && parts[0]) ? { fieldName: parts[0], fieldType: parts[1] } : null;
      }).filter(attr => attr !== null); // Éliminer les valeurs nulles
  
      const classData = {
        name: className,
        attributes: attributes
      };
  
      console.log('Données envoyées :', JSON.stringify(classData, null, 2));
      this.classService.createClass(classData).subscribe({
        next: (response) => console.log('Classe sauvegardée avec succès :', response),
        error: (error) => console.error('Erreur lors de la sauvegarde :', error)
      });
    });
  }
  


  drawLineBetweenShapes(startShape: Konva.Group, endShape: Konva.Group): void {
    const startRect = startShape.findOne('Rect') as Konva.Rect;
    const endRect = endShape.findOne('Rect') as Konva.Rect;
  
    if (startRect && endRect) {
      const startCenterX = startShape.x() + startRect.width() / 2;
      const startCenterY = startShape.y() + startRect.height() / 2;
  
      const endCenterX = endShape.x() + endRect.width() / 2;
      const endCenterY = endShape.y() + endRect.height() / 2;
  

      // Créer une ligne pour connecter les classes
      const line = new Konva.Line({
        points: [startCenterX, startCenterY, endCenterX, endCenterY],
        stroke: 'black',
        strokeWidth: 2,
        lineCap: 'round',
        lineJoin: 'round',
      });
  
      // Stocker les références aux classes de départ et d'arrivée
      line.setAttr('startShape', startShape);
      line.setAttr('endShape', endShape);

      // Ajouter des textes pour les cardinalités
      const startCardinalityText = new Konva.Text({
        text: '1', // Valeur par défaut
        fontSize: 12,
        fontFamily: 'Arial',
        fill: 'black',
        x: (startCenterX + endCenterX) / 2 - 30,
        y: (startCenterY + endCenterY) / 2 - 20,
      });
  
      const endCardinalityText = new Konva.Text({
        text: '1', // Valeur par défaut
        fontSize: 12,
        fontFamily: 'Arial',
        fill: 'black',
        x: (startCenterX + endCenterX) / 2 + 10,
        y: (startCenterY + endCenterY) / 2 - 20,
      });
      //const associationName = "Association Name";  // Or use some dynamic value if necessary

  

      const associationNameText = new Konva.Text({
        text: 'associationName',
        fontSize: 14,
        fontFamily: 'Arial',
        fill: 'black',
        x: (startCenterX + endCenterX) / 2 - 10,
        y: (startCenterY + endCenterY) / 2 + 15, // Position below the line
      });

      // Associer les textes de cardinalité à la ligne
      line.setAttr('startCardinalityText', startCardinalityText);
      line.setAttr('endCardinalityText', endCardinalityText);
      line.setAttr('associationNameText', associationNameText);

  
      // Ajouter un bouton "+" près de la ligne
      const plusButton = new Konva.Text({
        text: '+',
        fontSize: 16,
        fontFamily: 'Arial',
        fill: 'blue',
        x: (startCenterX + endCenterX) / 2 - 8,
        y: (startCenterY + endCenterY) / 2 - 30,
        cursor: 'pointer',
      });
  
      // Gérer le clic sur le bouton "+"
      plusButton.on('click', () => {
        this.openCardinalityDialogForLine(line);
      });
  
      // Ajouter la ligne, les cardinalités et le bouton "+" à la couche
      this.layer.add(line);
      this.layer.add(startCardinalityText);
      this.layer.add(endCardinalityText);
      this.layer.add(associationNameText);  // Add association name text
      this.layer.add(plusButton);
      this.lines.push(line);
  
      // Associer le bouton "+" à la ligne
      line.setAttr('plusButton', plusButton);
  
      // Mettre à jour la position des éléments lors du déplacement des formes
      const updateLineAndTexts = () => {
        const startCenterX = startShape.x() + startRect.width() / 2;
        const startCenterY = startShape.y() + startRect.height() / 2;
  
        const endCenterX = endShape.x() + endRect.width() / 2;
        const endCenterY = endShape.y() + endRect.height() / 2;
  
        // Mettre à jour les points de la ligne
        line.points([startCenterX, startCenterY, endCenterX, endCenterY]);
  
        // Mettre à jour la position des textes de cardinalité
        startCardinalityText.x((startCenterX + endCenterX) / 2 - 30);
        startCardinalityText.y((startCenterY + endCenterY) / 2 - 20);
  
        endCardinalityText.x((startCenterX + endCenterX) / 2 + 10);
        endCardinalityText.y((startCenterY + endCenterY) / 2 - 20);

        line.points([startCenterX, startCenterY, endCenterX, endCenterY]);
        associationNameText.x((startCenterX + endCenterX) / 2 - 10);
        associationNameText.y((startCenterY + endCenterY) / 2 + 15);
          
        // Mettre à jour la position du bouton "+"
        plusButton.x((startCenterX + endCenterX) / 2 - 8);
        plusButton.y((startCenterY + endCenterY) / 2 - 30);
  
        this.layer.batchDraw();
      };
  
      // Écouter les événements de déplacement des formes
      startShape.on('dragmove', updateLineAndTexts);
      endShape.on('dragmove', updateLineAndTexts);
  
      // Déplacer les classes au-dessus de la ligne
      startShape.moveToTop();
      endShape.moveToTop();
  
      this.layer.draw();
    }
  }

  updateConnectedLines(shape: Konva.Group): void {
    this.lines.forEach((line) => {
      const startShape = line.getAttr('startShape');
      const endShape = line.getAttr('endShape');

      if (startShape === shape || endShape === shape) {
        const startRect = startShape.findOne('Rect') as Konva.Rect;
        const endRect = endShape.findOne('Rect') as Konva.Rect;

        if (startRect && endRect) {
          const startCenterX = startShape.x() + startRect.width() / 2;
          const startCenterY = startShape.y() + startRect.height() / 2;

          const endCenterX = endShape.x() + endRect.width() / 2;
          const endCenterY = endShape.y() + endRect.height() / 2;


          // Mettre à jour les points de la ligne
          line.points([startCenterX, startCenterY, endCenterX, endCenterY]);
          this.layer.batchDraw();
        }
      }
    });
  }

  handleDoubleClick(event: any): void {
    const clickedGroup = event.target.findAncestor('Group');
    if (clickedGroup && clickedGroup.findOne('Rect')) {
      this.openDialogForShape(clickedGroup); // Ouvrir DialogComponent pour éditer la classe
    }
  }

  openDialogForShape(group: Konva.Group): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        className: '',
        tableData: [],
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateShapeWithData(group, result);
      }
    });
  }

  openCardinalityDialogForLine(line: Konva.Line): void {
    const startShape = line.getAttr('startShape');
    const endShape = line.getAttr('endShape');
  
    if (startShape && endShape) {
      const startClassTextNode = startShape.findOne('Text');
      const endClassTextNode = endShape.findOne('Text');
  
      const startClass = startClassTextNode instanceof Konva.Text ? startClassTextNode.text() : 'Source';
      const endClass = endClassTextNode instanceof Konva.Text ? endClassTextNode.text() : 'Target';
      const associationName = 'Association Name'; // Vous pouvez ajuster cela selon vos besoins

      // Ouvrir le CardinalityDialogComponent
      const dialogRef = this.dialog.open(CardinalityDialogComponent, {
        data: {
          startClass: startClass,
          endClass: endClass,
          associationName: associationName

        },
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const { startCardinality, endCardinality,associationName } = result;
  
          // Récupérer les textes de cardinalité associés à la ligne
          const startCardinalityText = line.getAttr('startCardinalityText') as Konva.Text;
          const endCardinalityText = line.getAttr('endCardinalityText') as Konva.Text;
  
          // Mettre à jour les textes des cardinalités
          if (startCardinalityText) {
            startCardinalityText.text(startCardinality || '1');
          }
  
          if (endCardinalityText) {
            endCardinalityText.text(endCardinality || '1');
          }
          const associationNameText = line.getAttr('associationNameText') as Konva.Text;
          if (associationNameText) {
            associationNameText.text(associationName || '');
          }
          

  
          this.layer.draw();
        }
      });
    }
  }

  updateShapeWithData(group: Konva.Group, data: any): void {
    const className = data.className || 'Classname';
    const attributes = data.tableData || [];

    let displayText = `${className}`;
    let attributesText = '';
    let methodsText = '';

    attributes.forEach((attr: any) => {
      attributesText += `+ ${attr.logicalName || 'field'}: ${attr.type || 'type'}\n`;

      if (attr.getter) {
        methodsText += `+ get${attr.logicalName || 'field'}(): ${attr.type || 'type'}\n`;
      }
      if (attr.setter) {
        methodsText += `+ set${attr.logicalName || 'field'}(${attr.logicalName || 'field'}: ${attr.type || 'type'}): void\n`;
      }
    });

    const combinedText = attributesText + methodsText;

    const rect = group.findOne('Rect') as Konva.Rect;
    const classNameText = group.findOne<Konva.Text>('Text');
    const separatorLine = group.findOne<Konva.Line>('Line');
    const attributesTextNode = group.findOne<Konva.Text>((node: Konva.Node) => {
      return node.getAttr('name') === 'attributesText';
    });

    if (rect && classNameText && separatorLine && attributesTextNode) {
      classNameText.text(displayText);
      attributesTextNode.text(combinedText);

      const maxTextWidth = Math.max(classNameText.width(), attributesTextNode.width());
      rect.width(maxTextWidth + 20);

      const totalHeight = classNameText.height() + separatorLine.height() + attributesTextNode.height() + 10;
      if (totalHeight > rect.height() - 10) {
        rect.height(totalHeight + 10);
      }

      separatorLine.points([0, 40, rect.width(), 40]);
      this.layer.draw();
    }
  }

  undo(): void {
    if (this.lines.length > 0) {
      const lastLine = this.lines.pop();
      if (lastLine) {
        // Récupérer les textes de cardinalité associés à la ligne
        const startCardinalityText = lastLine.getAttr('startCardinalityText') as Konva.Text;
        const endCardinalityText = lastLine.getAttr('endCardinalityText') as Konva.Text;
        const associationNameText = lastLine.getAttr('associationNameText') as Konva.Text;
  
        // Récupérer le bouton "+" associé à la ligne
        const plusButton = lastLine.getAttr('plusButton') as Konva.Text;
  
        // Supprimer les textes de cardinalité
        if (startCardinalityText) {
          startCardinalityText.destroy();
        }
        if (endCardinalityText) {
          endCardinalityText.destroy();
        }
        if (associationNameText) {
          associationNameText.destroy();
        }
  
        // Supprimer le bouton "+"
        if (plusButton) {
          plusButton.destroy();
        }
  
        // Supprimer la ligne
        lastLine.destroy();
        this.layer.draw();
        return;
      }
    }
  
    if (this.shapes.length > 0) {
      const lastShape = this.shapes.pop();
      if (lastShape) {
        lastShape.destroy();
        this.layer.draw();
      }
    }
  }
  
  clear(): void {
    // Supprimer toutes les lignes et leurs éléments associés
    this.lines.forEach((line) => {
      const startCardinalityText = line.getAttr('startCardinalityText') as Konva.Text;
      const endCardinalityText = line.getAttr('endCardinalityText') as Konva.Text;
      const associationNameText = line.getAttr('associationNameText') as Konva.Text;
      const plusButton = line.getAttr('plusButton') as Konva.Text;
  
      if (startCardinalityText) {
        startCardinalityText.destroy();
      }
      if (endCardinalityText) {
        endCardinalityText.destroy();
      }
      if (associationNameText) {
        associationNameText.destroy();
      }
      if (plusButton) {
        plusButton.destroy();
      }
  
      line.destroy();
    });
  
    // Supprimer toutes les formes
    this.shapes.forEach((shape) => {
      shape.destroy();
    });
  
    // Réinitialiser les tableaux
    this.shapes = [];
    this.lines = [];
  
    // Redessiner la couche
    this.layer.draw();
  }
}