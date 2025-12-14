import Alexa from 'alexa-remote2';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

const COOKIE_FILE = path.join(process.cwd(), '.alexa-cookie');

interface AlexaDevice {
  serialNumber: string;
  deviceType: string;
  deviceFamily: string;
  deviceOwnerCustomerId: string;
  accountName: string;
  online: boolean;
  dnd?: boolean;
}

class AlexaService extends EventEmitter {
  private alexa: Alexa;
  private initialized = false;
  private devices: AlexaDevice[] = [];

  constructor() {
    super();
    this.alexa = new Alexa();
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const cookieData = fs.existsSync(COOKIE_FILE)
        ? fs.readFileSync(COOKIE_FILE, 'utf-8')
        : undefined;

      this.alexa.init({
        cookie: cookieData,
        proxyOnly: true,
        proxyOwnIp: 'localhost',
        proxyPort: 3002,
        proxyLogLevel: 'warn',
        bluetooth: false,
        logger: console.log,
        alexaServiceHost: 'alexa.amazon.de',
        amazonPage: 'amazon.de',
        acceptLanguage: 'de-DE',
        formerRegistrationData: cookieData ? JSON.parse(cookieData) : undefined,
      }, (err) => {
        if (err) {
          console.error('Alexa init error:', err.message);
          reject(err);
          return;
        }

        const cookie = this.alexa.cookieData;
        if (cookie) {
          fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookie));
        }

        this.initialized = true;
        this.loadDevices();
        console.log('Alexa connected!');
        resolve();
      });
    });
  }

  private loadDevices(): void {
    this.alexa.getDevices((err, devices: any) => {
      if (err) {
        console.error('Error loading devices:', err);
        return;
      }

      const deviceList = devices?.devices || devices || {};
      // Filter: Nur Geräte mit Audio-Wiedergabe
      this.devices = Object.values(deviceList)
        .filter((d: any) => d.capabilities?.includes('AUDIO_PLAYER'))
        .map((d: any) => ({
          serialNumber: d.serialNumber,
          deviceType: d.deviceType,
          deviceFamily: d.deviceFamily,
          deviceOwnerCustomerId: d.deviceOwnerCustomerId,
          accountName: d.accountName,
          online: d.online,
          dnd: false,
        }));

      console.log(`Loaded ${this.devices.length} Alexa devices`);

      // DND Status laden
      this.loadDndStatus();
    });
  }

  private loadDndStatus(): void {
    this.alexa.getDoNotDisturb((err: any, result: any) => {
      if (err) {
        console.error('Error loading DND status:', err);
        return;
      }

      const dndList = result?.doNotDisturbDeviceStatusList || [];
      for (const dndDevice of dndList) {
        const device = this.devices.find(d => d.serialNumber === dndDevice.deviceSerialNumber);
        if (device) {
          device.dnd = dndDevice.enabled;
        }
      }
      console.log('DND status loaded');
    });
  }

  getDevices(): AlexaDevice[] {
    return this.devices;
  }

  async speak(deviceSerial: string, text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(new Error('Alexa not initialized'));
        return;
      }

      console.log(`Speaking "${text}" on device ${deviceSerial}`);
      this.alexa.sendSequenceCommand(
        deviceSerial,
        'speak',
        text,
        (err) => {
          if (err) {
            console.error('Speak error:', err);
            reject(err);
          } else {
            console.log('Speak command sent successfully');
            resolve();
          }
        }
      );
    });
  }

  async announce(text: string, deviceSerial?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(new Error('Alexa not initialized'));
        return;
      }

      console.log(`Announcing "${text}" on device ${deviceSerial || 'all'}`);

      if (deviceSerial && deviceSerial !== 'all') {
        // Einzelnes Gerät
        this.alexa.sendSequenceCommand(
          deviceSerial,
          'announcement',
          text,
          (err) => {
            if (err) {
              console.error('Announce error:', err);
              reject(err);
            } else {
              console.log('Announce command sent successfully');
              resolve();
            }
          }
        );
      } else {
        // Alle Geräte - nutze sendMultiSequenceCommand
        const firstDevice = this.devices[0]?.serialNumber;
        if (!firstDevice) {
          reject(new Error('Keine Geräte verfügbar'));
          return;
        }

        // Announcement geht automatisch an alle Geräte
        console.log(`Sending announcement to all via ${firstDevice}`);
        this.alexa.sendSequenceCommand(
          firstDevice,
          'announcement',
          text,
          (err) => {
            if (err) {
              console.error('Announce (all) error:', err);
              reject(err);
            } else {
              console.log('Announce (all) command sent successfully');
              resolve();
            }
          }
        );
      }
    });
  }

  async announceMultiple(text: string, deviceSerials: string[]): Promise<void> {
    if (!this.initialized) {
      throw new Error('Alexa not initialized');
    }

    console.log(`Announcing "${text}" on devices: ${deviceSerials.join(', ')}`);

    // Sequentiell auf allen Geräten senden
    for (const serial of deviceSerials) {
      await new Promise<void>((resolve, reject) => {
        this.alexa.sendSequenceCommand(
          serial,
          'announcement',
          text,
          (err) => {
            if (err) {
              console.error(`Announce error on ${serial}:`, err);
              reject(err);
            } else {
              console.log(`Announce sent to ${serial}`);
              resolve();
            }
          }
        );
      });
    }

    console.log('All announcements sent');
  }

  async whisper(deviceSerial: string, text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(new Error('Alexa not initialized'));
        return;
      }

      const ssmlText = `<speak><amazon:effect name="whispered">${text}</amazon:effect></speak>`;

      this.alexa.sendSequenceCommand(
        deviceSerial,
        'ssml',
        ssmlText,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async playSound(deviceSerial: string, soundId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(new Error('Alexa not initialized'));
        return;
      }

      console.log(`Playing sound "${soundId}" on device ${deviceSerial}`);

      // Nutze den nativen sound Befehl von alexa-remote2
      this.alexa.sendSequenceCommand(
        deviceSerial,
        'sound',
        soundId,
        (err) => {
          if (err) {
            console.error('Sound error:', err);
            // Fallback: Versuche über SSML
            const ssml = `<speak><audio src="${soundId}"/></speak>`;
            this.alexa.sendSequenceCommand(
              deviceSerial,
              'ssml',
              ssml,
              (err2) => {
                if (err2) reject(err2);
                else resolve();
              }
            );
          } else {
            console.log('Sound command sent successfully');
            resolve();
          }
        }
      );
    });
  }

  async setVolume(deviceSerial: string, volume: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(new Error('Alexa not initialized'));
        return;
      }

      // Volume zwischen 0 und 100
      const vol = Math.max(0, Math.min(100, volume));
      console.log(`Setting volume to ${vol} on device ${deviceSerial}`);

      this.alexa.sendSequenceCommand(
        deviceSerial,
        'volume',
        vol,
        (err) => {
          if (err) {
            console.error('Volume error:', err);
            reject(err);
          } else {
            console.log(`Volume set to ${vol}`);
            resolve();
          }
        }
      );
    });
  }

  async getVolume(deviceSerial: string): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(new Error('Alexa not initialized'));
        return;
      }

      this.alexa.getDeviceStatusList((err, result: any) => {
        if (err) {
          console.error('getDeviceStatusList error:', err);
          reject(err);
          return;
        }

        console.log('Device status list:', JSON.stringify(result, null, 2).substring(0, 500));

        const device = result?.deviceStates?.find(
          (d: any) => d.serialNumber === deviceSerial
        );

        const vol = device?.volumeSetting || 50;
        console.log(`Got volume ${vol} for device ${deviceSerial}`);
        resolve(vol);
      });
    });
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const alexaService = new AlexaService();
export type { AlexaDevice };
