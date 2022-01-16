package cc.nftlink.backend.api.nft;

import lombok.Data;

@Data
public class NftCreateRequest {
    private String name;
    private String image;
    private String description;
    private String chain;
    private String type;
}
