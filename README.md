# mht-zigbee-ssh

## <a id='mht-zigbee-ssh-purpose'></a>1. Mục tiêu
  * Sử dụng giao thức ssh để remote zigbee-gateway server
    * Setup wifi thông qua mobile-app
    * Nạp thông tin aws iot ca-certificate qua sftp

## <a id='mht-zigbee-ssh-module'></a>2. Module framework
  * nodejs: [ssh2](https://github.com/mscdex/ssh2)
  * react-native: Module có sẵn trong react-native

## <a id='mht-zigbee-ssh-command'></a>3. Linux command
3.1 Linux command stream
  * stdin: input stream thường sử dụng để tryền các argument
  * stdout & stderr: output stream thường sử dụng để ghi log

3.2 Linux command exit code
  * exit code == 0: command sucess
  * exit code != 0: command error


## <a id='mht-zigbee-ssh-wifi-setup'></a>4. Setup wifi thông qua ssh
4.1 Login

  * ~~Sử dụng user + password~~
    * testing only, khi release cần disable plain text password
  * Sử dụng public key
    * Sử dụng cho production release

4.2 Setup [WPA supplicant](https://wiki.archlinux.org/index.php/WPA_supplicant) (admin user)

* Ưu điểm
  * Đơn giản, user nằm trong sudo group có quyền can thiệp hệ thống
* Nhược điểm
  * Giới hạn quyền của user ở mức cao, có rủi ro về bảo mật, sai sót có thể gây hỏng hệ thống

* Config file:
  * > /etc/wpa_supplicant/wpa_supplicant.conf
  ```
  ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
  update_config=1
  ```

* Append wpa passphrase to wpa config:
  > wpa_passphrase \<ssid\> \<passphrase\> | sudo tee -a /etc/wpa_supplicant/wpa_supplicant.conf

* verify config:
  ```
  ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
  update_config=1
  network={
    ssid="ssid"
    #psk="passphrase"
    psk=2b1d17284c5410ee5eaae7151290e9744af2182b0eb8af20dd4ebb415928f726
  }
  ```

* Restart wpa_supplicant service
  > systemctl restart wpa_supplicant
* Restart dhcpcd service
  > systemctl restart dhcpcd

* [example-js](example-js) sử dụng [ssh2](https://github.com/mscdex/ssh2) module

4.3 Setup [WPA supplicant](https://wiki.archlinux.org/index.php/WPA_supplicant) (non-admin user)
  * Ưu điểm
    * User chỉ có quyền giới hạn chỉ nhằm mục đích input config data
  * Nhược điểm
    * Cần có 1 service monitor config changed & update
  * TODO
    * User input config file nằm trong user home folder
      * Implement giống trường hợp non-admin user với path:
        > /home/user/etc/wpa_supplicant/wpa_supplicant.conf
    * run cron job as root to check config is changed & update
      ```sh
      #/bin/sh
      while true; do
        # wait for change
        inotifywait -m -e modify /home/user/etc/wpa_supplicant/wpa_supplicant.conf > /dev/null

        # update wpa_supplicant config
        cp -f /home/user/etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf

        # restart wpa_supplicant
        systemctl restart wpa_supplicant

        # restart dhcpcd client
        systemctl restart dhcpcd
      done
      ```

4.4 Setup aws iot ca-certificate
  * TODO
    * sử dụng sftp service để truyền file