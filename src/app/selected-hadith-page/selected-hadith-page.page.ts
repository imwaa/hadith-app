import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HadithList } from '../interfaces/hadithDTO';
import { HadithServiceService } from '../services/hadith-service.service';
import { Share } from '@capacitor/share';
import { StorageServiceService } from '../services/storage-service.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-selected-hadith-page',
  templateUrl: './selected-hadith-page.page.html',
  styleUrls: ['./selected-hadith-page.page.scss'],
})
export class SelectedHadithPagePage implements OnInit {
  public hadith: HadithList;
  public hadithNumber: any;
  public isStored: boolean = false;
  public hadithDbIndex: number;

  constructor(
    private route: ActivatedRoute,
    private hadithService: HadithServiceService,
    private storage: StorageServiceService,
    public toastController: ToastController
  ) {
    this.hadithNumber = this.route.snapshot.paramMap.get('id');
    this.loadData();
  }

  ngOnInit() {
    this.hadith = this.hadithService.getOneHadith(this.hadithNumber);
  }

  async hadithFavorisPopUp() {
    const toast = await this.toastController.create({
      message: this.isStored?'Hadith ajouté aux favoris':  'Hadith Supprimé des favoris',
      mode: 'ios',
      color: this.isStored? 'primary':'danger' ,
      duration: 1000
    });
    toast.present();

    const { role } = await toast.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }


  savedHadithManage(index) {
    if (this.isStored) {
      this.removeHadith();
    } else {
      this.saveHadith(index);
    }
  }

  async saveHadith(index) {
    await this.storage.setHadithFavoris(index);
    this.isStored = true;
    this.hadithFavorisPopUp()
  }

  async removeHadith() {
    await this.storage.removeHadithFavoris(this.hadithDbIndex);
    this.isStored = false;
    this.hadithFavorisPopUp();
  }

  loadData() {
    this.storage.getHadithFavoris().subscribe((res:Number[]) => {
      if (res != null) {
        if(res.includes(this.hadithNumber)){
          this.isStored = true;
          this.hadithDbIndex = res.indexOf(this.hadithNumber)
        }
      }
    });
  }

  async shareHadith(hadith_num) {
    await Share.share({
      title: this.hadith.hadithContent[hadith_num].title,
      text: this.hadith.hadithContent[hadith_num].contenu,
      dialogTitle: 'Partager un Hadith Nawawi',
    });
  }
}
