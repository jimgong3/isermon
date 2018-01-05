//
//  Global.swift
//  isermon
//
//  Created by jim on 26/12/2017.
//  Copyright © 2017年 jimgong. All rights reserved.
//

import Foundation
import Alamofire

class Me {
    static let sharedInstance = Me()
    var username: String?
    var email: String?
    
    var liked_sermon_ids: Set<String>?
    var bookmarked_sermon_ids: Set<String>?
}

var selectedTabIndex = 0    //Latest


// MARK: - Global Functions

func audit(username: String, action: String,
           remarks1: String? = nil, remarks2: String? = nil, remarks3: String? = nil,
           completion: @escaping (_ result: String) -> ()){
    var urlStr: String?
    urlStr = "http://" + SERVER_IP + ":" + PORT + "/audit"
    let url = URL(string: urlStr!)
    print("url: \(url!)")
    
    var parameters: Parameters = [
        "username": username,
        "action": action
    ]
    if remarks1 != nil {
        parameters["remarks1"] = remarks1
    }
    if remarks2 != nil {
        parameters["remarks2"] = remarks2
    }
    if remarks3 != nil {
        parameters["remarks3"] = remarks3
    }
    
    Alamofire.request(url!, method: .post, parameters: parameters, encoding: URLEncoding.default).responseString { response in
        if let result = response.result.value {
            //                print("Response: \(result)")
            completion(result)
        }
    }
}
