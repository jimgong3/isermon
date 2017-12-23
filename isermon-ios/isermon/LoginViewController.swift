//
//  LoginViewController.swift
//  isermon
//
//  Created by jim on 21/12/2017.
//  Copyright © 2017年 jimgong. All rights reserved.
//

import UIKit
import Alamofire

class LoginViewController: UIViewController, UITextFieldDelegate {

    @IBOutlet weak var username: UITextField!
    @IBOutlet weak var password: UITextField!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        username.delegate = self
        password.delegate = self
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        username.resignFirstResponder()
        password.resignFirstResponder()
        return true
    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

    @IBAction func login(_ sender: Any) {
        isermon.login(username: username.text!, password: password.text!, completion: {(result: String) -> () in
            print("login result: \(result)")
            if result.range(of:"success") != nil {
                Me.sharedInstance.username = self.username.text!
                
                let alert = UIAlertController(title: "提示", message: "登錄成功。", preferredStyle: .alert)
                alert.addAction(UIAlertAction(title: NSLocalizedString("好", comment: "Default action"), style: .`default`, handler: { _ in
                    NSLog("The \"OK\" alert occured.")
                }))
                self.present(alert, animated: true, completion: nil)
                
                UserDefaults.standard.set(self.username.text, forKey: "username")
                UserDefaults.standard.set(self.password.text, forKey: "password")
                
                isermon.getLikelist(username: self.username.text!, completion: {(sermon_ids: Set<String>) -> () in
                    Me.sharedInstance.liked_sermon_ids = sermon_ids
                })
                isermon.getBookmark(username: self.username.text!, completion: {(sermon_ids: Set<String>) -> () in
                    Me.sharedInstance.bookmarked_sermon_ids = sermon_ids
                })
            } else {
                let alert = UIAlertController(title: "提示", message: "登錄不成功，請檢查登錄名和密碼。", preferredStyle: .alert)
                alert.addAction(UIAlertAction(title: NSLocalizedString("好", comment: "Default action"), style: .`default`, handler: { _ in
                    NSLog("The \"OK\" alert occured.")
                }))
                self.present(alert, animated: true, completion: nil)
            }
        })
    }
    
}

func login(username: String, password: String, completion: @escaping (_ result: String) -> ()){
    
    var urlStr: String?
    urlStr = "http://" + SERVER_IP + ":" + PORT + "/loginByJson"
    let url = URL(string: urlStr!)
    print("Query>> url: \(url!)")
    
    let parameters: Parameters = [
        "username": username,
        "password": password
    ]
    
    Alamofire.request(url!, method: .post, parameters: parameters, encoding: URLEncoding.default).responseString { response in
        if let result = response.result.value {
            print("Response: \(result)")
            completion(result)
        }
    }
}


func getLikelist(username: String, completion: @escaping (_ sermon_ids: Set<String>) -> ()){
    let url = URL(string: "http://" + SERVER_IP + ":" + PORT + "/likes?username=" + username)
    print("Query:>> url: ")
    print(url!)
    
    Alamofire.request(url!).responseJSON { response in
        var sermon_ids = Set<String>()
        if let json = response.result.value {
            if let array = json as? [Any] {
                if array.count>0 {
                    let likelistJson = array[0] as? [String: Any]
                    print(likelistJson as Any)
                    let sids = likelistJson!["sermon_ids"] as! [String]
                    if sids.count>0 {
                        for i in 0...sids.count-1 {
                            sermon_ids.insert(sids[i])
                        }
                    }
                }
                else{
                    print("Query>> oops, nothing has been liked")
                }
            }
            print ("Query>> \(sermon_ids.count)" + " sermons found, callback completion")
            completion(sermon_ids)
        }
    }
}

func getBookmark(username: String, completion: @escaping (_ sermon_ids: Set<String>) -> ()){
    let url = URL(string: "http://" + SERVER_IP + ":" + PORT + "/bookmarks?username=" + username)
    print("Query:>> url: ")
    print(url!)
    
    Alamofire.request(url!).responseJSON { response in
        var sermon_ids = Set<String>()
        if let json = response.result.value {
            if let array = json as? [Any] {
                if array.count>0 {
                    let bookmarkJson = array[0] as? [String: Any]
                    print(bookmarkJson as Any)
                    let sids = bookmarkJson!["sermon_ids"] as! [String]
                    if sids.count>0 {
                        for i in 0...sids.count-1 {
                            sermon_ids.insert(sids[i])
                        }
                    }
                }
                else{
                    print("Query>> oops, nothing has been bookmarked")
                }
            }
            print ("Query>> \(sermon_ids.count)" + " sermons found, callback completion")
            completion(sermon_ids)
        }
    }
}


