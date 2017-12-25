//
//  SubscribedUserTableViewCell.swift
//  isermon
//
//  Created by jim on 25/12/2017.
//  Copyright © 2017年 jimgong. All rights reserved.
//

import UIKit

class SubscribedUserTableViewCell: UITableViewCell {

    @IBOutlet weak var subscribedUsername: UILabel!
  
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}
