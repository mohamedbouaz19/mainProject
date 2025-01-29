import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttributeDialogComponent } from './attribute-dialog.component';


describe('EntiteDialogComponent', () => {
  let component: AttributeDialogComponent;
  let fixture: ComponentFixture<AttributeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributeDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttributeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
