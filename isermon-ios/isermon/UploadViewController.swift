//
//  UploadViewController.swift
//  isermon
//
//  Created by jim on 13/12/2017.
//  Copyright © 2017年 jimgong. All rights reserved.
//

import UIKit
import Alamofire
import WebKit

class UploadViewController: UIViewController, UITextFieldDelegate, WKUIDelegate {
    
    @IBOutlet weak var titleText: UITextField!
    @IBOutlet weak var descText: UITextField!
//    @IBOutlet weak var speakerText: UITextField!
    @IBOutlet weak var urlText: UITextField!
//    @IBOutlet weak var scriptureText: UITextField!
//    @IBOutlet weak var infoText: UITextField!
//    @IBOutlet weak var langText: UITextField!
    
    @IBOutlet weak var webView: UIWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
//        titleText.delegate = self
//        descText.delegate = self
//        urlText.delegate = self
        
        let url = URL(string: "http://" + SERVER_IP + ":" + PORT + "/upload")
        print("load url page: ")
        print(url!)
        let request = URLRequest(url: url!)
        webView.loadRequest(request)
    }
    
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
//        titleText.resignFirstResponder()
//        descText.resignFirstResponder()
//        urlText.resignFirstResponder()
        return true
    }


    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

    @IBAction func upload(_ sender: Any) {
        print("upload")
        uploadSermon(title: titleText.text!,
                     description: descText.text,
//                     speaker: speakerText.text!,
                     url: urlText.text!,
//                     scripture: scriptureText.text,
//                     info: infoText.text, lang: langText.text,
                     username: "guest",
                     completion: {(sermon: Sermon) -> () in
            print("upload complete")
                        
            let alert = UIAlertController(title: "提示", message: "上傳成功。", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: NSLocalizedString("好", comment: "Default action"), style: .`default`, handler: { _ in
                NSLog("The \"OK\" alert occured.")
            }))
            self.present(alert, animated: true, completion: nil)
        })

    }
    
    @IBAction func back(_ sender: Any) {
        if webView.canGoBack {
            webView.goBack()
        }
    }
    
    @IBAction func cancel(_ sender: Any) {
        webView.stopLoading()
    }
}

func uploadSermon(title: String,
                  speaker: String? = nil,
                  description: String? = nil,
                  url: String,
                  scripture: String? = nil,
                  info: String? = nil,
                  lang: String? = nil,
                  username: String? = nil,
                  completion: @escaping (_ sermon: Sermon) -> ()){
    
    print("uploadSermon>> start...")
    
    var urlStrUpload: String?
    urlStrUpload = "http://" + SERVER_IP + ":" + PORT + "/upload"
    let urlUpload = URL(string: urlStrUpload!)
    print("Query>> add new sermon, url (POST): \(String(describing: urlUpload))")
    //    print(url)
    
    //    let parameters: Parameters = [
    //        "title": title,
    //        "author": author,
    //        "isbn": isbn
    //   ]
    var parameters = [String: Any]()
    var hasError = false
    var errorMsg = ""
    
    if title != "" {
        parameters["title"] = title
    } else {
        hasError = true
        errorMsg = "標題不能留空。"
    }

//    if speaker != "" {
//        parameters["speaker"] = speaker
//    } else {
//        hasError = true
//        errorMsg = "講員不能留空。"
//    }

    if description != nil && description != "" {
        parameters["description"] = description!
    }

    if url != "" {
        parameters["url"] = url
    } else {
        hasError = true
        errorMsg = "URL不能留空。"
    }

//    if scripture != nil && scripture != "" {
//        parameters["scripture"] = scripture!
//    }
//
//    if info != nil && info != "" {
//        parameters["info"] = info!
//    }
//
//    if lang != nil && lang != "" {
//        parameters["lang"] = lang!
//    }

    if username != nil && username != "" {
        parameters["username"] = username!
    }

    if hasError {
        print("Query>> has error, cannot upload: \(errorMsg)")
    } else {
        print("Query>> send request to server...")
        Alamofire.request(urlUpload!, method: .post, parameters: parameters, encoding: URLEncoding.default).responseJSON { response in
            print("Query>> Request: \(String(describing: response.request))")   // original url request
            print("Query>> Response: \(String(describing: response.response))") // http url response
            print("Query>> Result: \(response.result)")                         // response serialization result
            
            if let json = response.result.value {
                print("JSON: \(json)") // serialized json response
                if let array = json as? [Any] {
                    if array.count>0 {
                        print("Query>> book added success")
                        let sermonJson = array[0] as? [String: Any]
                        let s = Sermon(json: sermonJson!)
                        completion(s!)
                    }
                    else{
                        print("Query>> sermon add failure")
                        let s = Sermon(title: "")     
                        completion(s!)
                    }
                } else {
                    let s = Sermon(title: "")
                    completion(s!)
                }
            }
        }
    }
}

